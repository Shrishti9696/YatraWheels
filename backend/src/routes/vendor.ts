import { Router } from "express";
import { protect, vendorOnly } from "../middlewares/auth";
import {
  getVendorDashboard,
  getVendorVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVendorBookings,
  updateBookingStatus,
  getVendorEarnings,
} from "../controllers/vendorController";

const router = Router();

router.use(protect, vendorOnly);

router.get("/dashboard", getVendorDashboard);
router.get("/vehicles", getVendorVehicles);
router.get("/earnings", getVendorEarnings);
router.post("/vehicles", addVehicle);
router.put("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);
router.get("/bookings", getVendorBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

export default router;
