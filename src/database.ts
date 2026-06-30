import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "./config.js";
import type { TripDashboard, TripItinerary } from "./types.js";

let db: Database.Database | undefined;

export const getDatabase = (): Database.Database => {
  if (db) {
    return db;
  }

  mkdirSync(dirname(config.databasePath), { recursive: true });
  db = new Database(config.databasePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      destination TEXT NOT NULL,
      days INTEGER NOT NULL,
      style TEXT NOT NULL,
      start_date TEXT NOT NULL,
      itinerary TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return db;
};

export const saveTrip = (trip: TripDashboard): void => {
  getDatabase()
    .prepare(
      `INSERT INTO trips (id, destination, days, style, start_date, itinerary, created_at)
       VALUES (@id, @destination, @days, @style, @start_date, @itinerary, @created_at)`
    )
    .run({
      ...trip,
      itinerary: JSON.stringify(trip.itinerary)
    });
};

export const findTripById = (id: string): TripDashboard | undefined => {
  const row = getDatabase()
    .prepare("SELECT id, destination, days, style, start_date, itinerary, created_at FROM trips WHERE id = ?")
    .get(id) as (Omit<TripDashboard, "itinerary"> & { itinerary: string }) | undefined;

  if (!row) {
    return undefined;
  }

  return {
    ...row,
    itinerary: JSON.parse(row.itinerary) as TripItinerary
  };
};

export const closeDatabase = (): void => {
  if (!db) {
    return;
  }

  db.close();
  db = undefined;
};
