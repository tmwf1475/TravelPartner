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

export type TripDashboard = {
  id: string;
  destination: string;
  days: number;
  style: string;
  start_date: string;
  itinerary: TripItinerary;
  created_at: string;
};

export type GenerateTripRequest = {
  destination: string;
  days: number;
  style: string;
  start_date: string;
};

export type TripResponse = {
  trip: TripDashboard;
};
