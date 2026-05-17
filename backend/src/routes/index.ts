import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import vehicleRouter from "./vehicles";
import bookingRouter from "./bookings";
import tripRouter from "./trips";
import paymentRouter from "./payments";
import leadRouter from "./leads";
import upgradeRouter from "./upgrade";
import vendorRouter from "./vendor";
import driverRouter, { driverPublicRouter } from "./driver";
import adminRouter from "./admin";
import aiChatRouter from "./aiChat";
import configRouter from "./config";
import mapboxRouter from "./mapbox";
import uploadRouter from "./upload";
import messageRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/vehicles", vehicleRouter);
router.use("/bookings", bookingRouter);
router.use("/trips", tripRouter);
router.use("/payments", paymentRouter);
router.use("/lead", leadRouter);
router.use("/upgrade", upgradeRouter);
router.use("/vendor", vendorRouter);
router.use("/driver", driverRouter);
router.use("/drivers", driverPublicRouter);
router.use("/admin", adminRouter);
router.use("/ai", aiChatRouter);
router.use("/config", configRouter);
router.use("/mapbox", mapboxRouter);
router.use("/upload", uploadRouter);
router.use("/messages", messageRouter);

export default router;
