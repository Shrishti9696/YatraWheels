import { Router } from "express";
import { sendMessageREST, getMessagesByBooking } from "../controllers/messageController";
import { protect } from "../middlewares/auth";

const messageRouter = Router();

// Fallback REST endpoints for chat
messageRouter.post("/", protect, sendMessageREST);
messageRouter.get("/:bookingId", protect, getMessagesByBooking);

export default messageRouter;
