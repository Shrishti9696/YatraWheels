import { Router } from "express";
import { createTrip, getUserTrips } from "../controllers/tripController";
import { protect } from "../middlewares/auth";

const router = Router();

router.use(protect);

router.post("/generate", createTrip);
router.get("/my", getUserTrips);

export default router;
