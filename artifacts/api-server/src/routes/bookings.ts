import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController";
import { protect } from "../middlewares/auth";

const router = Router();

router.use(protect);

router.post("/", createBooking);
router.get("/my", getUserBookings);
router.get("/:id", getBookingById);
router.put("/:id/status", updateBookingStatus);
router.delete("/:id", cancelBooking);

export default router;
