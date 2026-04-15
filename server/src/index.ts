import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireAuth } from "./lib/auth";
import { prisma } from "./lib/prisma";
/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";

/* CONFIGURATIONS */
const app = express();
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

/* ROUTES */
app.get("/", (req, res) => {
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

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* SERVER */
const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`Server running on port ${env.port}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("unhandledRejection", async (error) => {
  console.error("Unhandled promise rejection:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception:", error);
  await prisma.$disconnect();
  process.exit(1);
});
