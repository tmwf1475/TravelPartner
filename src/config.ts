export type AppConfig = {
  port: number;
  nodeEnv: string;
  databasePath: string;
  geminiApiKey: string;
};

const isTest = process.env.NODE_ENV === "test";

if (!isTest && !process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

export const config: AppConfig = {
  port: Number.parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databasePath: process.env.DATABASE_PATH ?? "./data/travelpartner.sqlite",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "test-key"
};
