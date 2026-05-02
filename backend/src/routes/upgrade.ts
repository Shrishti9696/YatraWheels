import { Router } from "express";
import { protect } from "../middlewares/auth";
import {
  getUpgradeStatus,
  createUpgradeOrder,
  verifyUpgradePayment,
} from "../controllers/upgradeController";

const router = Router();

router.use(protect);

router.get("/status", getUpgradeStatus);
router.post("/order", createUpgradeOrder);
router.post("/verify", verifyUpgradePayment);

export default router;
