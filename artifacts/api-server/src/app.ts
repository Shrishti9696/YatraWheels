import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { connectDatabase } from "./config/database";
import { seedDatabase } from "./config/seeder";
import { errorHandler, notFound } from "./middlewares/error";

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

const allowedOrigins = process.env["FRONTEND_URL"]
  ? [
      process.env["FRONTEND_URL"],
      /\.vercel\.app$/,
      "http://localhost:5173",
      "http://localhost:3000",
    ]
  : true;

app.use(cors({
  origin: allowedOrigins,
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
