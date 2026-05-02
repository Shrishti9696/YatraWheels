import { Router } from "express";
import { register, login, getMe, updateProfile, changePassword, verifyOTP, resendOTP } from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;
