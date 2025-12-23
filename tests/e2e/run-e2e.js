const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const clientDir = path.join(rootDir, "client");
const mockServerScript = path.join(__dirname, "mock-api-server.js");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForUrl = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server is reachable or the timeout expires.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const startProcess = (command, args, options) =>
  spawn(command, args, {
    stdio: "inherit",
    detached: process.platform !== "win32",
    ...options,
  });

const stopProcess = (child) => {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === "win32") {
    child.kill("SIGTERM");
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
};

const run = async () => {
  let mockServer;
  let nextServer;
  let testProcess;

  const cleanup = () => {
    stopProcess(testProcess);
    stopProcess(nextServer);
    stopProcess(mockServer);
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  try {
    mockServer = startProcess(process.execPath, [mockServerScript], {
      cwd: rootDir,
    });
    nextServer = startProcess(
      npmCommand,
      ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3001"],
      {
        cwd: clientDir,
        env: {
          ...process.env,
          NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:4010",
          NEXT_PUBLIC_SUPABASE_URL: "YOUR_SUPABASE_URL",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
        },
      },
    );

    await Promise.all([
      waitForUrl("http://127.0.0.1:4010/health", 120_000),
      waitForUrl("http://127.0.0.1:3001", 120_000),
    ]);

    testProcess = startProcess(
      npxCommand,
      ["playwright", "test", "--project=e2e", "--workers=1"],
      {
        cwd: rootDir,
        env: {
          ...process.env,
          PLAYWRIGHT_TEST_BASE_URL: "http://127.0.0.1:3001",
        },
      },
    );

    const exitCode = await new Promise((resolve, reject) => {
      testProcess.on("exit", resolve);
      testProcess.on("error", reject);
    });

    cleanup();
    process.exit(exitCode ?? 1);
  } catch (error) {
    cleanup();
    console.error(error);
    process.exit(1);
  }
};

void run();
