import { Router } from "express";
import { handleAIChat } from "../controllers/aiChatController";

const router = Router();

router.post("/chat", handleAIChat);

export default router;
