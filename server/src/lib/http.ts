import { Response } from "express";

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const sendError = (res: Response, error: unknown) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return res.status(500).json({ message });
};

export const parseOptionalDate = (value: unknown, fieldName: string) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} must be a valid date`);
  }

  return date;
};

export function requireNumber(value: unknown, fieldName: string): number;
export function requireNumber(
  value: unknown,
  fieldName: string,
  options: { optional: true },
): number | undefined;
export function requireNumber(
  value: unknown,
  fieldName: string,
  options?: { optional?: boolean },
) {
  if (
    options?.optional &&
    (value === undefined || value === null || value === "")
  ) {
    return undefined;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    throw new HttpError(400, `${fieldName} must be a valid number`);
  }

  return parsedValue;
};

export function requireString(value: unknown, fieldName: string): string;
export function requireString(
  value: unknown,
  fieldName: string,
  options: { optional: true },
): string | undefined;
export function requireString(
  value: unknown,
  fieldName: string,
  options?: { optional?: boolean },
) {
  if (typeof value !== "string") {
    if (options?.optional && (value === undefined || value === null)) {
      return undefined;
    }
    throw new HttpError(400, `${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();
  if (!options?.optional && !trimmedValue) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return trimmedValue || undefined;
};
