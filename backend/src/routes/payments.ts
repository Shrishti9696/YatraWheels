import { Router } from "express";
import { createOrder, verifyPayment, getPaymentById } from "../controllers/paymentController";
import { protect } from "../middlewares/auth";

const router = Router();

router.use(protect);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/:id", getPaymentById);

export default router;
