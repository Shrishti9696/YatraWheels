import { Router } from "express";
import { protect, adminOnly } from "../middlewares/auth";
import {
  getAdminAnalytics,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  getPendingVehicles,
  approveVehicleAction,
  getAllBookings,
  updateBookingStatus,
  getAllDrivers,
  approveDriver,
  verifyDriverLicense,
} from "../controllers/adminController";

const router = Router();

router.use(protect, adminOnly);

router.get("/analytics", getAdminAnalytics);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.put("/users/:id/role", updateUserRole);

router.get("/vehicles/pending", getPendingVehicles);
router.patch("/vehicles/:id/approve", approveVehicleAction);

router.get("/bookings", getAllBookings);
router.put("/bookings/:id/status", updateBookingStatus);

router.get("/drivers", getAllDrivers);
router.put("/drivers/:id/status", approveDriver);
router.patch("/drivers/:id/license", verifyDriverLicense);

export default router;
