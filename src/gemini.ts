import { GoogleGenAI } from "@google/genai";
import { config } from "./config.js";
import type { GenerateTripRequest, ItineraryDay, TripItinerary } from "./types.js";

const createFallbackItinerary = (request: GenerateTripRequest): TripItinerary => ({
  summary: `${request.days}-day ${request.destination} itinerary for ${request.style}.`,
  highlights: [
    `${request.destination} local culture`,
    `${request.style} friendly route`,
    `Starts on ${request.start_date}`
  ],
  days: Array.from({ length: request.days }, (_, index): ItineraryDay => {
    const day = index + 1;

    return {
      day,
      title: `${request.destination} day ${day}`,
      morning: `Explore a signature ${request.destination} neighborhood at an easy pace.`,
      afternoon: `Visit a landmark or themed stop that matches ${request.style}.`,
      evening: `Enjoy dinner and a relaxed night walk in ${request.destination}.`,
      food: [`${request.destination} local specialty`, "Seasonal dessert"],
      tips: ["Keep transit time realistic.", "Reserve popular restaurants in advance."]
    };
  })
});

const normalizeStringArray = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items : fallback;
};

const normalizeItinerary = (value: unknown, request: GenerateTripRequest): TripItinerary => {
  const fallback = createFallbackItinerary(request);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const source = value as Record<string, unknown>;
  const days = Array.isArray(source.days) ? source.days : [];

  return {
    summary: typeof source.summary === "string" && source.summary.trim().length > 0 ? source.summary : fallback.summary,
    highlights: normalizeStringArray(source.highlights, fallback.highlights),
    days: Array.from({ length: request.days }, (_, index): ItineraryDay => {
      const fallbackDay = fallback.days[index];
      const sourceDay = days[index] && typeof days[index] === "object" ? (days[index] as Record<string, unknown>) : {};

      return {
        day: index + 1,
        title: typeof sourceDay.title === "string" && sourceDay.title.trim().length > 0 ? sourceDay.title : fallbackDay.title,
        morning:
          typeof sourceDay.morning === "string" && sourceDay.morning.trim().length > 0
            ? sourceDay.morning
            : fallbackDay.morning,
        afternoon:
          typeof sourceDay.afternoon === "string" && sourceDay.afternoon.trim().length > 0
            ? sourceDay.afternoon
            : fallbackDay.afternoon,
        evening:
          typeof sourceDay.evening === "string" && sourceDay.evening.trim().length > 0
            ? sourceDay.evening
            : fallbackDay.evening,
        food: normalizeStringArray(sourceDay.food, fallbackDay.food),
        tips: normalizeStringArray(sourceDay.tips, fallbackDay.tips)
      };
    })
  };
};

const extractJsonObject = (text: string): unknown => {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch?.[1] ?? text;
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not contain a JSON object");
  }

  return JSON.parse(jsonText.slice(start, end + 1)) as unknown;
};

export const generateItinerary = async (request: GenerateTripRequest): Promise<TripItinerary> => {
  if (config.nodeEnv === "test") {
    return createFallbackItinerary(request);
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const prompt = `Create a travel itinerary as JSON only. Destination: ${request.destination}. Days: ${request.days}. Style: ${request.style}. Start date: ${request.start_date}. Return exactly this shape: {"summary":"string","highlights":["string"],"days":[{"day":1,"title":"string","morning":"string","afternoon":"string","evening":"string","food":["string"],"tips":["string"]}]}. Include exactly ${request.days} days.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini response was empty");
  }

  return normalizeItinerary(extractJsonObject(text), request);
};
