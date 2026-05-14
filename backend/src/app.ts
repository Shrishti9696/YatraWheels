import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { validateEnv } from "./lib/envValidator";
import { connectDatabase } from "./config/database";
import { seedDatabase } from "./config/seeder";
import { errorHandler, notFound } from "./middlewares/error";

// ── Startup environment check (logs warnings, never crashes) ──
validateEnv();

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const FRONTEND_URL = process.env["FRONTEND_URL"] || "http://localhost:5173";

app.use(cors({
  origin: [FRONTEND_URL, /\.replit\.app$/, /\.replit\.dev$/],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

connectDatabase()
  .then(() => seedDatabase())
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB");
  });

export default app;
