import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";

describe("POST /api/trips/generate-all validation", () => {
  it("returns VALIDATION_ERROR before trip generation when required fields are missing", async () => {
    const response = await request(app).post("/api/trips/generate-all").send({
      destination: "東京"
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: expect.any(String),
      details: expect.any(Object)
    });

    const dashboardResponse = await request(app).get("/api/trips/invalid-request/dashboard");
    expect(dashboardResponse.status).toBe(404);
  });
});
