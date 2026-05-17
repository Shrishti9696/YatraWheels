import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { logger } from "./lib/logger";
import { deliverUndeliveredMessages, saveAndEmitMessage } from "./controllers/messageController";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

// Initialize Socket.io with robust configuration for Replit
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"], // polling as fallback
});

// Store connected sockets for undelivered message logic
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    connectedUsers.set(userId, socket.id);
    logger.info({ userId, socketId: socket.id }, "User connected to socket");

    socket.join(userId);
    deliverUndeliveredMessages(userId);

    socket.on("send_message", async (data: { receiverId: string; bookingId: string; text: string }) => {
      await saveAndEmitMessage(userId, data.receiverId, data.bookingId, data.text);
    });
  }

  socket.on("disconnect", () => {
    if (userId) {
      connectedUsers.delete(userId);
      logger.info({ userId }, "User disconnected from socket");
    }
  });
});

// Export io for use in controllers
export { io };

server.listen(port, () => {
  logger.info({ port }, "Server listening with Socket.io");
});
