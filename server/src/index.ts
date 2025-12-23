import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { app } from "./app";

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
