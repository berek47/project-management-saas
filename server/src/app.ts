import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireAuth } from "./lib/auth";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import activityLogRoutes from "./routes/activityLogRoutes";
import exportRoutes from "./routes/exportRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

export const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "project-management-api",
    message: "Project Management API is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(requireAuth);

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/conversations", conversationRoutes);
app.use("/activity", activityLogRoutes);
app.use("/export", exportRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
