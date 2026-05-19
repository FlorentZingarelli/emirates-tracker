"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EmiratesFlight } from "../lib/types";
import { emiratesFleet, type Aircraft } from "../lib/fleet";

/* ─── Constants ─── */
const OPENSKY_URL = "/emirates-tracker/data/flights.json";

/* ─── Types ─── */
type TabId = "live" | "search" | "fleet";

interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number;
  lastContact: number;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  sensors: number[] | null;
  geoAltitude: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
}

function parseFlightNumber(callsign: string): string {
  const clean = callsign.trim().replace(/\s+/g, "");
  if (clean.startsWith("UAE")) return "EK" + clean.slice(3);
  return clean;
}

function statesToFlights(states: OpenSkyState[]): EmiratesFlight[] {
  return states
    .filter((s) => {
      const cs = (s.callsign || "").trim().replace(/\s+/g, "");
      return cs.startsWith("UAE") && s.latitude !== null && s.longitude !== null;
    })
    .map((s) => ({
      callsign: (s.callsign || "").trim(),
      flightNumber: parseFlightNumber(s.callsign || ""),
      longitude: s.longitude ?? 0,
      latitude: s.latitude ?? 0,
      altitude: Math.round((s.baroAltitude ?? 0) * 3.28084),
      speed: s.velocity !== null ? Math.round(s.velocity * 1.94384) : 0,
      heading: Math.round(s.trueTrack ?? 0),
      verticalRate: s.verticalRate !== null ? Math.round(s.verticalRate * 196.85) : 0,
      onGround: s.onGround,
      originCountry: s.originCountry,
      lastContact: s.lastContact,
    }))
    .sort((a, b) => a.flightNumber.localeCompare(b.flightNumber));
}

/* ─── Hook: live flight polling ─── */
function useFlights() {
  const [flights, setFlights] = useState<EmiratesFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch(OPENSKY_URL);
      if (!res.ok) throw new Error(`OpenSky HTTP ${res.status}`);
      const data = await res.json();
      setFlights(statesToFlights(data.states ?? []));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load flights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    const iv = setInterval(fetchFlights, 30_000);
    return () => clearInterval(iv);
  }, [fetchFlights]);

  return { flights, loading, error, refetch: fetchFlights };
}

/* ─── Hook: search ─── */
function useFlightSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EmiratesFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(OPENSKY_URL);
      if (!res.ok) throw new Error(`OpenSky HTTP ${res.status}`);
      const data = await res.json();
      const allFlights = statesToFlights(data.states ?? []);
      const upper = q.toUpperCase();
      setResults(
        allFlights.filter(
          (f) => f.flightNumber.includes(upper) || f.callsign.includes(upper)
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { query, setQuery, results, loading, error, searched, search };
}

/* ─── Icons (inline SVG) ─── */
const IconPlane = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconFleet = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 3h18v18H3z M9 3v18 M15 3v18 M3 9h18 M3 15h18" />
  </svg>
);
const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
);

/* ─── Tab: Live Flights ─── */
function LiveFlightsTab() {
  const { flights, loading, error, refetch } = useFlights();

  function formatTime(ts: number) {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="px-4 pt-4 pb-safe">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-emirates-dark dark:text-white">
            Live Flights
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {loading
              ? "Loading..."
              : `${flights.length} Emirates flight${flights.length !== 1 ? "s" : ""} airborne`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emirates-red bg-red-50 dark:bg-red-950/30 rounded-full hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
        >
          <IconRefresh /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <div className="animate-spin h-8 w-8 border-2 border-emirates-red border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Fetching live flight data...</p>
        </div>
      ) : flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <span className="text-4xl mb-3">🛩️</span>
          <p className="text-sm font-medium">No Emirates flights in range</p>
          <p className="text-xs mt-1">Data refreshes every 30 seconds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flights.map((f, i) => (
            <div
              key={`${f.callsign}-${i}`}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm"
            >
              {/* Flight number + status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emirates-red text-white text-xs font-bold rounded-lg">
                    <span className="live-dot h-1.5 w-1.5 bg-white rounded-full inline-block" />
                    {f.flightNumber}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {f.onGround ? "🛬 On ground" : "🛫 En route"}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 tabular-nums">
                  {formatTime(f.lastContact)}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Altitude</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {f.altitude > 0 ? `${f.altitude.toLocaleString()} ft` : "0 ft"}
                  </p>
                </div>
                <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Speed</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {f.speed > 0 ? `${f.speed} kn` : "0 kn"}
                  </p>
                </div>
                <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Heading</p>
                  <p className="text-sm font-semibold tabular-nums">{f.heading}°</p>
                </div>
              </div>

              {/* Coordinates */}
              <div className="mt-2 text-[10px] text-zinc-400 text-center tabular-nums">
                {f.latitude.toFixed(3)}°N &middot; {f.longitude.toFixed(3)}°E
                {f.originCountry !== "United Arab Emirates" && (
                  <span className="ml-1">&middot; {f.originCountry}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Tab: Flight Search ─── */
function SearchTab() {
  const { query, setQuery, results, loading, error, searched, search } =
    useFlightSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(query);
  }

  function formatTime(ts: number) {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="px-4 pt-4 pb-safe">
      <h2 className="text-lg font-bold text-emirates-dark dark:text-white mb-1">
        Flight Search
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Search by flight number (e.g. EK25, EK501)
      </p>

      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="EK25, UAE25K..."
          className="w-full px-4 py-3 pl-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emirates-red/30 focus:border-emirates-red transition-all"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx={11} cy={11} r={8} />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-emirates-red border-t-transparent rounded-full" />
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
          <span className="text-4xl mb-2">🔍</span>
          <p className="text-sm font-medium">No flights found</p>
          <p className="text-xs mt-1">Try a different flight number</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">
            {results.length} flight{results.length !== 1 ? "s" : ""} found
          </p>
          {results.map((f, i) => (
            <div
              key={`${f.callsign}-${i}`}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-emirates-red text-white text-xs font-bold rounded-lg">
                  {f.flightNumber}
                </span>
                <span className="text-xs text-zinc-500">
                  {f.onGround ? "🛬 On ground" : "🛫 En route"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-400">Alt: </span>
                  <span className="font-medium tabular-nums">{f.altitude.toLocaleString()} ft</span>
                </div>
                <div>
                  <span className="text-zinc-400">Speed: </span>
                  <span className="font-medium tabular-nums">{f.speed} kn</span>
                </div>
                <div>
                  <span className="text-zinc-400">Heading: </span>
                  <span className="font-medium tabular-nums">{f.heading}°</span>
                </div>
                <div>
                  <span className="text-zinc-400">Last: </span>
                  <span className="font-medium">{formatTime(f.lastContact)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Tab: Fleet Info ─── */
function FleetTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const categories = emiratesFleet.reduce<Record<string, Aircraft[]>>(
    (acc, a) => {
      const key = a.type.split("-")[0];
      (acc[key] ??= []).push(a);
      return acc;
    },
    {}
  );

  return (
    <div className="px-4 pt-4 pb-safe">
      <h2 className="text-lg font-bold text-emirates-dark dark:text-white mb-1">
        Emirates Fleet
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        {emiratesFleet.filter((a) => a.inService > 0).reduce((s, a) => s + a.inService, 0)} aircraft in service
      </p>

      <div className="space-y-3">
        {Object.entries(categories).map(([family, aircraft]) => (
          <div key={family}>
            <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2 px-1 uppercase tracking-wider">
              {family === "A380" ? "Airbus A380" : family === "B777" ? "Boeing 777" : family}
            </h3>
            <div className="space-y-2">
              {aircraft.map((a) => {
                const isOpen = selected === a.registration;
                return (
                  <button
                    key={a.registration}
                    onClick={() => setSelected(isOpen ? null : a.registration)}
                    className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emirates-dark dark:text-white">
                          {a.registration}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {a.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emirates-red">
                          {a.inService}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          in service
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <span className="text-zinc-400">Type: </span>
                          <span className="font-medium">{a.type}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Seats: </span>
                          <span className="font-medium">{a.seats}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Engines: </span>
                          <span className="font-medium">{a.engines}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Range: </span>
                          <span className="font-medium">{a.range}</span>
                        </div>
                        {a.notes && (
                          <div className="col-span-2 mt-1 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-700 dark:text-amber-400">
                            {a.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-emirates-dark dark:text-white">
            Destinations
          </span>
          <span className="text-xs text-zinc-400">130+</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-emirates-dark dark:text-white">
            Hubs
          </span>
          <span className="text-xs text-zinc-400">DXB &middot; DWC</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">
          Emirates operates one of the largest and youngest commercial fleets in the world
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("live");

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "live", label: "Live", icon: <IconPlane /> },
    { id: "search", label: "Search", icon: <IconSearch /> },
    { id: "fleet", label: "Fleet", icon: <IconFleet /> },
  ];

  return (
    <div className="flex flex-col flex-1 w-full max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-[#0F0F1A]/95 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emirates-red rounded-xl flex items-center justify-center text-white text-sm font-bold">
            EK
          </div>
          <div>
            <h1 className="text-base font-bold text-emirates-dark dark:text-white leading-tight">
              Emirates Tracker
            </h1>
            <p className="text-[10px] text-zinc-500">Real-time flight data</p>
          </div>
          <div className="ml-auto">
            <span className="flex items-center gap-1 text-[10px] text-zinc-400">
              <span className="live-dot h-1.5 w-1.5 bg-emirates-red rounded-full inline-block" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "live" && <LiveFlightsTab />}
        {activeTab === "search" && <SearchTab />}
        {activeTab === "fleet" && <FleetTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex flex-col items-center py-2.5 transition-all ${
                  isActive
                    ? "text-emirates-red"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-red-50 dark:bg-red-950/30"
                      : ""
                  }`}
                >
                  {t.icon}
                </div>
                <span className="text-[10px] font-medium mt-0.5">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}