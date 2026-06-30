import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/server.js";

describe("POST /api/trips/generate-all", () => {
  it("generates and stores a typed itinerary without calling Gemini in test", async () => {
    const response = await request(app).post("/api/trips/generate-all").send({
      destination: "東京",
      days: 2,
      style: "自由行、美食、動漫",
      start_date: "2026-08-01"
    });

    expect(response.status).toBe(201);
    expect(response.body.trip).toMatchObject({
      id: expect.any(String),
      destination: "東京",
      days: 2,
      style: "自由行、美食、動漫",
      start_date: "2026-08-01",
      created_at: expect.any(String),
      itinerary: {
        summary: expect.any(String),
        highlights: expect.any(Array),
        days: expect.any(Array)
      }
    });
    expect(response.body.trip.itinerary.days).toHaveLength(2);
    expect(response.body.trip.itinerary.days[0]).toMatchObject({
      day: 1,
      title: expect.any(String),
      morning: expect.any(String),
      afternoon: expect.any(String),
      evening: expect.any(String),
      food: expect.any(Array),
      tips: expect.any(Array)
    });

    const dashboardResponse = await request(app).get(`/api/trips/${response.body.trip.id}/dashboard`);
    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.body.trip.id).toBe(response.body.trip.id);
  });
});
