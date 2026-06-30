import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";

describe("GET /health", () => {
  it("returns service health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("TravelPartner");
    expect(response.body.timestamp).toBeDefined();
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
