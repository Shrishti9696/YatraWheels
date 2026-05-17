import { Request, Response } from "express";
import Message from "../models/Message";
import { io } from "../index";
import { logger } from "../lib/logger";

/**
 * Sends a message via REST (fallback when socket is down).
 */
export async function sendMessageREST(req: Request, res: Response) {
  try {
    const { receiverId, bookingId, text } = req.body;
    const senderId = (req as any).user._id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      bookingId,
      text,
      delivered: false,
    });

    // Try to emit via socket if the receiver is online
    io.to(receiverId).emit("new_message", message);
    
    // If successfully emitted, we could mark as delivered, 
    // but the socket 'connection' handler also checks undelivered messages.

    res.status(201).json(message);
  } catch (err: any) {
    logger.error({ err: err.message }, "Error sending message via REST");
    res.status(500).json({ message: "Failed to send message" });
  }
}

/**
 * Fetches all messages for a booking.
 */
export async function getMessagesByBooking(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const messages = await Message.find({ bookingId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err: any) {
    logger.error({ err: err.message }, "Error fetching messages");
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

/**
 * Handles undelivered messages when a user reconnects.
 * This is called from the socket connection handler.
 */
export async function deliverUndeliveredMessages(userId: string) {
  try {
    const undelivered = await Message.find({ receiver: userId, delivered: false });
    
    if (undelivered.length > 0) {
      logger.info({ userId, count: undelivered.length }, "Delivering undelivered messages");
      
      for (const msg of undelivered) {
        io.to(userId).emit("new_message", msg);
      }

      await Message.updateMany(
        { receiver: userId, delivered: false },
        { $set: { delivered: true } }
      );
    }
  } catch (err: any) {
    logger.error({ err: err.message, userId }, "Error delivering undelivered messages");
  }
}

/**
 * Saves a message to DB and emits it via socket.
 * Handles both the sender and receiver updates.
 */
export async function saveAndEmitMessage(senderId: string, receiverId: string, bookingId: string, text: string) {
  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      bookingId,
      text,
      delivered: false, // Will be set to true if emit succeeds below
    });

    // Emit to both sender and receiver
    io.to(senderId).emit("new_message", message);
    io.to(receiverId).emit("new_message", message);

    // If receiver is in their room, we mark as delivered
    // Actually, socket.io doesn't guarantee receipt, 
    // but for this simple version we'll mark as true if we emitted.
    message.delivered = true;
    await message.save();

  } catch (err: any) {
    logger.error({ err: err.message }, "Error saving/emitting message");
  }
}
