import { Router } from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookedDates,
} from "../controllers/bookingController";
import { protect } from "../middlewares/auth";

const router = Router();

// Public route for calendar disabling
router.get("/vehicle/:vehicleId/booked-dates", getBookedDates);

router.use(protect);

router.post("/", createBooking);
router.get("/my", getUserBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

export default router;
