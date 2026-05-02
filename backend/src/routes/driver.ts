import { Router } from "express";
import { protect, driverOnly } from "../middlewares/auth";
import {
  getDriverProfile,
  getDriverDashboard,
  toggleAvailability,
  getDriverBookings,
  getAvailableDrivers,
  updateDriverProfile,
} from "../controllers/driverController";

const router = Router();

router.use(protect, driverOnly);

router.get("/profile", getDriverProfile);
router.get("/dashboard", getDriverDashboard);
router.put("/availability", toggleAvailability);
router.get("/bookings", getDriverBookings);
router.put("/profile", updateDriverProfile);

// Also available to all authenticated users (for booking flow)
const publicRouter = Router();
publicRouter.get("/available", protect, getAvailableDrivers);

export { publicRouter as driverPublicRouter };
export default router;
