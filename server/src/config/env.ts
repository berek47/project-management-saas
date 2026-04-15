import dotenv from "dotenv";
import { HttpError } from "../lib/http";

dotenv.config();

const placeholderValues = new Set([
  "",
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY",
]);

const parsePort = (value: string | undefined) => {
  if (!value) return 8000;

  const parsedPort = Number(value);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new HttpError(500, "PORT must be a valid positive integer");
  }

  return parsedPort;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT),
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
};

export const isPreviewAuthMode =
  placeholderValues.has(env.supabaseUrl) ||
  placeholderValues.has(env.supabaseAnonKey);
