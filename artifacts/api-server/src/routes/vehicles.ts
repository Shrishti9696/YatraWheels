import { Router } from "express";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController";
import { protect, adminOnly } from "../middlewares/auth";

const router = Router();

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.post("/", protect, adminOnly, createVehicle);
router.put("/:id", protect, adminOnly, updateVehicle);
router.delete("/:id", protect, adminOnly, deleteVehicle);

export default router;
