import express from "express";
import type { Server } from "node:http";
import { config } from "./config.js";
import { closeDatabase } from "./database.js";
import { errorHandler, notFoundHandler } from "./errors.js";
import { generateAllTrip, getTripDashboard } from "./trips.js";

export const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "TravelPartner",
    status: "ok",
    health: "/health"
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "TravelPartner",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/trips/generate-all", generateAllTrip);
app.get("/api/trips/:id/dashboard", getTripDashboard);

app.use(notFoundHandler);
app.use(errorHandler);

let server: Server | undefined;

const shutdown = (signal: NodeJS.Signals): void => {
  console.info(`${signal} received. Shutting down TravelPartner.`);

  const finish = (): void => {
    closeDatabase();
    process.exit(0);
  };

  if (!server) {
    finish();
    return;
  }

  server.close(finish);
};

if (process.env.NODE_ENV !== "test") {
  server = app.listen(config.port, () => {
    console.info(`TravelPartner server running on http://localhost:${config.port}`);
    console.info(`NODE_ENV=${config.nodeEnv}`);
    console.info(`DATABASE_PATH=${config.databasePath}`);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
