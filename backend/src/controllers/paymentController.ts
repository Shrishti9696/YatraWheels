import { Request, Response } from "express";
import Payment from "../models/Payment";
import Booking from "../models/Booking";
import User from "../models/User";
import { createRazorpayOrder, verifyRazorpaySignature } from "../services/paymentService";
import { AuthRequest } from "../middlewares/auth";
import { sendBookingConfirmationEmail } from "../services/emailService";
import { logger } from "../lib/logger";
import { isRazorpayAvailable } from "../lib/envValidator";

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  // Graceful fallback when Razorpay keys are not configured
  if (!isRazorpayAvailable()) {
    logger.warn("Razorpay keys not set — payment service unavailable");
    res.status(503).json({ success: false, message: "Payment service is currently unavailable" });
    return;
  }

  const { bookingId } = req.body;
  const userId = req.user!.id;

  if (!bookingId) {
    res.status(400).json({ message: "bookingId is required" });
    return;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  if (String(booking.userId) !== userId) {
    res.status(403).json({ message: "Not authorized for this booking" });
    return;
  }

  if (booking.status === "confirmed") {
    res.status(400).json({ message: "Booking is already confirmed" });
    return;
  }

  const existingPayment = await Payment.findOne({
    bookingId,
    paymentStatus: "success",
  });
  if (existingPayment) {
    res.status(400).json({ message: "Payment already completed for this booking" });
    return;
  }

  const order = await createRazorpayOrder(booking.totalPrice, bookingId);

  const payment = await Payment.create({
    userId,
    bookingId,
    amount: booking.totalPrice,
    currency: "INR",
    paymentProvider: "razorpay",
    paymentStatus: "pending",
    razorpayOrderId: order.id,
  });

  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
    keyId: process.env["RAZORPAY_KEY_ID"],
  });
}

export async function verifyPayment(req: AuthRequest, res: Response): Promise<void> {
  // Graceful fallback when Razorpay keys are not configured
  if (!isRazorpayAvailable()) {
    logger.warn("Razorpay keys not set — payment verification unavailable");
    res.status(503).json({ success: false, message: "Payment service is currently unavailable" });
    return;
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
    res.status(400).json({ message: "Missing payment verification fields" });
    return;
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { paymentStatus: "failed" }
    );
    res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    return;
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      paymentStatus: "success",
      razorpayPaymentId,
      razorpaySignature,
    },
    { new: true }
  );

  const booking = await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" }, { new: true })
    .populate("vehicleId", "name");

  // Send booking confirmation email asynchronously (don't block response)
  if (booking && payment) {
    try {
      const user = await User.findById(req.user!.id).lean();
      if (user && user.email) {
        const vehicleId = booking.vehicleId as any;
        const vehicleName = vehicleId?.name || "Your Vehicle";

        sendBookingConfirmationEmail({
          userName: user.name,
          userEmail: user.email,
          bookingId: String(booking._id),
          vehicleName,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          date: String(booking.date),
          passengers: booking.passengers,
          totalPrice: booking.totalPrice,
          razorpayPaymentId,
        }).catch(err => {
          logger.warn({ err: err.message }, "Booking confirmation email failed (non-blocking)");
        });
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, "Could not fetch user for confirmation email");
    }
  }

  res.json({
    message: "Payment verified. Booking confirmed.",
    payment,
  });
}

export async function getPaymentById(req: AuthRequest, res: Response): Promise<void> {
  const payment = await Payment.findById(req.params["id"]).populate("bookingId");
  if (!payment) {
    res.status(404).json({ message: "Payment not found" });
    return;
  }

  if (String(payment.userId) !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  res.json(payment);
}
