export type ItineraryDay = {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string[];
  tips: string[];
};

export type TripItinerary = {
  summary: string;
  highlights: string[];
  days: ItineraryDay[];
};

export type Trip = {
  id: string;
  destination: string;
  days: number;
  style: string;
  start_date: string;
  created_at: string;
  itinerary: TripItinerary;
};

export type GenerateTripPayload = {
  destination: string;
  days: number;
  style: string;
  start_date: string;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};
