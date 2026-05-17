import { Router } from "express";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  aiSearch,
} from "../controllers/vehicleController";
import { protect, adminOnly } from "../middlewares/auth";

const router = Router();

router.get("/", getVehicles);
router.post("/ai-search", aiSearch);
router.get("/:id", getVehicleById);

// Admin routes
router.post("/", protect, adminOnly, createVehicle);
router.put("/:id", protect, adminOnly, updateVehicle);
router.delete("/:id", protect, adminOnly, deleteVehicle);

export default router;
