import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errors.js";
import { findTripById, saveTrip } from "./database.js";
import { generateItinerary } from "./gemini.js";
import type { GenerateTripRequest, TripDashboard } from "./types.js";

type GenerateTripBody = {
  destination?: unknown;
  days?: unknown;
  style?: unknown;
  start_date?: unknown;
};

const validateGenerateTripBody = (body: GenerateTripBody): GenerateTripRequest => {
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
    destination: body.destination as string,
    days: body.days as number,
    style: body.style as string,
    start_date: body.start_date as string
  };
};

export const generateAllTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = validateGenerateTripBody(req.body as GenerateTripBody);
    const request = {
      destination: body.destination.trim(),
      days: body.days,
      style: body.style.trim(),
      start_date: body.start_date
    };
    const itinerary = await generateItinerary(request);
    const trip: TripDashboard = {
      id: randomUUID(),
      ...request,
      created_at: new Date().toISOString(),
      itinerary
    };

    saveTrip(trip);
    res.status(201).json({ trip });
  } catch (error) {
    next(error);
  }
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
