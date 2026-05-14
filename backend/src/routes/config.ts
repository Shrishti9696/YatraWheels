import { Router } from "express";
import { getFeatures } from "../controllers/configController";

const configRouter = Router();

// Public endpoint — no auth required
configRouter.get("/features", getFeatures);

export default configRouter;
