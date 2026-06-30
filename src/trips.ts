import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { ApiError } from "./errors.js";
import { findTripById, saveTrip } from "./database.js";

type GenerateTripBody = {
  destination?: unknown;
  days?: unknown;
  style?: unknown;
  start_date?: unknown;
};

type ValidGenerateTripBody = {
  destination: string;
  days: number;
  style: string;
  start_date: string;
};

const validateGenerateTripBody = (body: GenerateTripBody): ValidGenerateTripBody => {
  const details: Record<string, string> = {};

  if (typeof body.destination !== "string" || body.destination.trim().length === 0) {
    details.destination = "destination is required";
  }

  if (typeof body.days !== "number" || !Number.isInteger(body.days) || body.days < 1) {
    details.days = "days must be a positive integer";
  }

  if (typeof body.style !== "string" || body.style.trim().length === 0) {
    details.style = "style is required";
  }

  if (typeof body.start_date !== "string" || Number.isNaN(Date.parse(body.start_date))) {
    details.start_date = "start_date must be a valid date string";
  }

  if (Object.keys(details).length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid trip generation request", details);
  }

  return {
    destination: body.destination,
    days: body.days,
    style: body.style,
    start_date: body.start_date
  } as ValidGenerateTripBody;
};

export const generateAllTrip = (req: Request, res: Response): void => {
  const body = validateGenerateTripBody(req.body as GenerateTripBody);
  const now = new Date().toISOString();
  const trip = {
    id: randomUUID(),
    destination: body.destination.trim(),
    days: body.days,
    style: body.style.trim(),
    start_date: body.start_date,
    created_at: now,
    itinerary: {
      summary: `${body.days}-day trip to ${body.destination}`,
      days: Array.from({ length: body.days }, (_, index) => ({
        day: index + 1,
        title: `${body.destination} day ${index + 1}`,
        notes: "Generated placeholder itinerary for MVP. Gemini integration can replace this after validation."
      }))
    }
  };

  saveTrip(trip);
  res.status(201).json({ trip });
};

export const getTripDashboard = (req: Request, res: Response): void => {
  const id = req.params.id;

  if (typeof id !== "string" || id.length === 0) {
    throw new ApiError(404, "NOT_FOUND", "Trip not found", { id });
  }

  const trip = findTripById(id);

  if (!trip) {
    throw new ApiError(404, "NOT_FOUND", "Trip not found", { id });
  }

  res.json({ trip });
};
