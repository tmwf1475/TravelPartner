import type { ApiErrorResponse, GenerateTripPayload, Trip } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T | ApiErrorResponse;

  if (!response.ok) {
    const apiError = data as ApiErrorResponse;
    throw new Error(apiError.error?.message ?? "Request failed");
  }

  return data as T;
};

export const getHealth = async (): Promise<{ status: string; service: string; timestamp: string }> => {
  const response = await fetch(`${apiBaseUrl}/health`);
  return parseJson(response);
};

export const generateTrip = async (payload: GenerateTripPayload): Promise<Trip> => {
  const response = await fetch(`${apiBaseUrl}/api/trips/generate-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await parseJson<{ trip: Trip }>(response);
  return data.trip;
};

export const getTripDashboard = async (id: string): Promise<Trip> => {
  const response = await fetch(`${apiBaseUrl}/api/trips/${encodeURIComponent(id)}/dashboard`);
  const data = await parseJson<{ trip: Trip }>(response);
  return data.trip;
};
