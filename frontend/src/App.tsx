import { FormEvent, useEffect, useState } from "react";
import { generateTrip, getHealth, getTripDashboard } from "./api";
import type { GenerateTripPayload, Trip } from "./types";

const initialPayload: GenerateTripPayload = {
  destination: "東京",
  days: 3,
  style: "自由行、美食、動漫",
  start_date: "2026-08-01"
};

export const App = () => {
  const [payload, setPayload] = useState<GenerateTripPayload>(initialPayload);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    getHealth()
      .then(() => {
        if (!ignore) {
          setHealth("online");
        }
      })
      .catch(() => {
        if (!ignore) {
          setHealth("offline");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const generatedTrip = await generateTrip(payload);
      setTrip(generatedTrip);
      setLookupId(generatedTrip.id);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate trip");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDashboardLookup = async () => {
    if (!lookupId.trim()) {
      setError("Enter a trip id first.");
      return;
    }

    setError(null);
    setIsLoadingDashboard(true);

    try {
      setTrip(await getTripDashboard(lookupId.trim()));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">TravelPartner MVP</p>
          <h1>Plan cinematic trips with a dashboard built for decisions.</h1>
          <p className="hero-text">
            Generate a structured itinerary, store it, and reopen the trip dashboard by id. The interface blends
            travel-card storytelling with SaaS-style operational clarity.
          </p>
        </div>
        <div className={`health-pill ${health}`}>Backend {health}</div>
      </section>

      <section className="workspace-grid">
        <form className="planner-card" onSubmit={handleGenerate}>
          <div>
            <p className="section-label">Trip generator</p>
            <h2>Build a new route</h2>
          </div>

          <label>
            Destination
            <input
              value={payload.destination}
              onChange={(event) => setPayload({ ...payload, destination: event.target.value })}
              placeholder="東京"
            />
          </label>

          <div className="form-row">
            <label>
              Days
              <input
                min="1"
                type="number"
                value={payload.days}
                onChange={(event) => setPayload({ ...payload, days: Number(event.target.value) })}
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={payload.start_date}
                onChange={(event) => setPayload({ ...payload, start_date: event.target.value })}
              />
            </label>
          </div>

          <label>
            Travel style
            <textarea
              value={payload.style}
              onChange={(event) => setPayload({ ...payload, style: event.target.value })}
              placeholder="自由行、美食、動漫"
              rows={4}
            />
          </label>

          <button disabled={isGenerating} type="submit">
            {isGenerating ? "Generating..." : "Generate itinerary"}
          </button>
        </form>

        <aside className="dashboard-card">
          <p className="section-label">Dashboard</p>
          <h2>{trip ? trip.destination : "No trip loaded"}</h2>
          <div className="metric-grid">
            <div>
              <span>Days</span>
              <strong>{trip?.days ?? "--"}</strong>
            </div>
            <div>
              <span>Style</span>
              <strong>{trip?.style ?? "--"}</strong>
            </div>
            <div>
              <span>Start</span>
              <strong>{trip?.start_date ?? "--"}</strong>
            </div>
          </div>
          <div className="lookup-box">
            <label>
              Trip id
              <input value={lookupId} onChange={(event) => setLookupId(event.target.value)} placeholder="Paste trip id" />
            </label>
            <button className="secondary-button" disabled={isLoadingDashboard} type="button" onClick={handleDashboardLookup}>
              {isLoadingDashboard ? "Loading..." : "Open dashboard"}
            </button>
          </div>
          {trip ? <code className="trip-id">{trip.id}</code> : null}
        </aside>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {trip ? (
        <section className="itinerary-section">
          <div className="summary-card">
            <p className="section-label">AI itinerary</p>
            <h2>{trip.itinerary.summary}</h2>
            <div className="highlight-row">
              {trip.itinerary.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </div>

          <div className="day-grid">
            {trip.itinerary.days.map((day) => (
              <article className="day-card" key={day.day}>
                <div className="day-number">Day {day.day}</div>
                <h3>{day.title}</h3>
                <dl>
                  <dt>Morning</dt>
                  <dd>{day.morning}</dd>
                  <dt>Afternoon</dt>
                  <dd>{day.afternoon}</dd>
                  <dt>Evening</dt>
                  <dd>{day.evening}</dd>
                </dl>
                <div className="tag-row">
                  {day.food.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <ul>
                  {day.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};
