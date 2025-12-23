import { expect, test } from "playwright/test";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import { app } from "../../server/src/app";
import { prisma } from "../../server/src/lib/prisma";

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
  server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  await prisma.$disconnect();
});

test.describe("server app", () => {
  test("returns service metadata from the root route", async ({ request }) => {
    const response = await request.get(`${baseURL}/`);

    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "project-management-api",
      message: "Project Management API is running",
    });
  });

  test("returns a basic health payload", async ({ request }) => {
    const response = await request.get(`${baseURL}/health`);

    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  test("guards authenticated routes without a bearer token", async ({
    request,
  }) => {
    const response = await request.get(`${baseURL}/projects`);

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Authentication required",
    });
  });

  test("returns a 404 payload for unknown routes", async ({ request }) => {
    const response = await request.get(`${baseURL}/missing-route`);

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "Route not found",
    });
  });
});
