import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRouter from "./routes/auth.routes";
import organizationRouter from "./routes/organization.routes";
import departmentRouter from "./routes/department.routes";
import employeeRouter from "./routes/employee.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// 1. Security Header Protection
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS security policy"));
      }
    },
    credentials: true,
  })
);

// 3. Compression for response payloads
app.use(compression());

// 4. Body & Cookie Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 5. Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api/", globalLimiter);

// 6. Routes Mapping
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organization", organizationRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/employees", employeeRouter);

// 7. Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// 8. Global Error Handler Middleware
app.use(errorHandler);

export default app;
