import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";

describe("GET /api/trips/:id/dashboard", () => {
  it("returns NOT_FOUND for a missing trip", async () => {
    const response = await request(app).get("/api/trips/non-existing-id/dashboard");

    expect(response.status).toBe(404);
    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
      message: expect.any(String),
      details: expect.any(Object)
    });
  });
});
