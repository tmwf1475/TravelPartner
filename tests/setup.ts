import { afterAll, beforeAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";

const testDatabaseFiles = ["./data/test.sqlite", "./data/test.sqlite-shm", "./data/test.sqlite-wal"];

process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = "./data/test.sqlite";
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
