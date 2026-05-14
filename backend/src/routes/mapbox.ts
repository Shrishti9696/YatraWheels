import { Router } from "express";
import { requireMapbox } from "../controllers/mapboxController";
import { protect } from "../middlewares/auth";

const mapboxRouter = Router();

// Endpoint to get map token, guarded by feature availability
mapboxRouter.get("/token", protect, requireMapbox);

export default mapboxRouter;
