import { afterAll, beforeAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";

const testDatabasePath = `./data/test-${process.env.VITEST_POOL_ID ?? process.pid}.sqlite`;
const testDatabaseFiles = [testDatabasePath, `${testDatabasePath}-shm`, `${testDatabasePath}-wal`];

process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = testDatabasePath;
process.env.GEMINI_API_KEY = "test-key";

beforeAll(() => {
  mkdirSync("./data", { recursive: true });
});

afterAll(async () => {
  const { closeDatabase } = await import("../src/database.js");
  closeDatabase();

  for (const file of testDatabaseFiles) {
    rmSync(file, { force: true });
  }
});
