import { Router } from "express";
import { protect, adminOnly } from "../middlewares/auth";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllVehicles,
  approveVehicle,
  getAllBookings,
  updateBookingStatus,
  getAllDrivers,
  approveDriver,
} from "../controllers/adminController";

const router = Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/vehicles", getAllVehicles);
router.put("/vehicles/:id/approve", approveVehicle);
router.get("/bookings", getAllBookings);
router.put("/bookings/:id/status", updateBookingStatus);
router.get("/drivers", getAllDrivers);
router.put("/drivers/:id/status", approveDriver);

export default router;
