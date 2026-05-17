import { Router } from "express";
import { protect, driverOnly } from "../middlewares/auth";
import {
  getDriverProfile,
  toggleAvailability,
  updateLocation,
  getDriverEarnings,
  updateTripStatus,
  uploadLicense,
  getAvailableDrivers,
} from "../controllers/driverController";

const router = Router();

router.use(protect, driverOnly);

router.get("/profile", getDriverProfile);
router.patch("/availability", toggleAvailability);
router.patch("/location", updateLocation);
router.get("/earnings", getDriverEarnings);
router.patch("/trips/:bookingId/status", updateTripStatus);
router.post("/license", uploadLicense);

// Also available to all authenticated users (for booking flow)
const publicRouter = Router();
publicRouter.get("/available", protect, getAvailableDrivers);

export { publicRouter as driverPublicRouter };
export default router;
