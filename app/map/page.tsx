"use client";

import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import RealMap, { MapRef } from "@/components/map/RealMap";
import { DEFAULT_EVENTS, Event } from "@/lib/events";

// Status types including 'all'
type FilterType = "all" | "upcoming" | "ongoing" | "past";

// Status colors (green/yellow/gray)
const statusColors: Record<Exclude<FilterType, "all">, string> = {
  upcoming: "#10b981", // green
  ongoing: "#facc15", // yellow
  past: "#9ca3af", // gray
};

// Color for "All" filter button
const allFilterColor = "#3b82f6"; // blue

export default function MapPage() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const mapRef = useRef<MapRef>(null);

  // Filter events based on search and activeFilter
  const filteredEvents = useMemo(() => {
    return DEFAULT_EVENTS.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ? true : event.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex-1 relative">
        {/* SEARCH BAR */}
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to do?"
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white shadow-lg outline-none text-sm"
            />
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="fixed top-[140px] left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-2 border border-white/40">
            {(["all", "upcoming", "ongoing", "past"] as FilterType[]).map(
              (status) => {
                const isActive = activeFilter === status;
                const buttonColor =
                  status === "all"
                    ? allFilterColor
                    : statusColors[status as Exclude<FilterType, "all">];

                return (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`flex-1 flex flex-col items-center py-2 rounded-xl transition`}
                    style={{
                      backgroundColor: isActive ? buttonColor : "transparent",
                    }}
                  >
                    <span className="flex items-center gap-1">
                      {/* Show dot only if not active */}
                      {!isActive && status !== "all" && (
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: buttonColor }}
                        />
                      )}
                      <span className="text-lg">
                        {status === "upcoming"
                          ? "📅"
                          : status === "ongoing"
                            ? "🔥"
                            : status === "past"
                              ? "📁"
                              : "🌐"}
                      </span>
                    </span>
                    <span
                      className={`text-[11px] font-medium capitalize transition`}
                      style={{
                        color: isActive
                          ? "#fff"
                          : status === "all"
                            ? allFilterColor
                            : statusColors[
                                status as Exclude<FilterType, "all">
                              ],
                      }}
                    >
                      {status}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* MAP */}
        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          filteredEvents={filteredEvents}
        />

        {/* USER LOCATION BUTTON */}
        {!selected && (
          <button
            onClick={() => mapRef.current?.flyToUser()}
            className="absolute right-4 bottom-[160px] z-40 bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center active:scale-95 transition"
          >
            📍
          </button>
        )}

        {/* BOTTOM SHEET */}
        {selected && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="absolute bottom-[90px] left-0 w-full bg-white rounded-t-3xl shadow-2xl z-50"
          >
            <div className="p-5 pb-8">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{selected.title}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 w-full h-40 rounded-xl overflow-hidden">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="mt-4 text-sm text-gray-500">
                📍 {selected.lat}, {selected.lng}
              </p>

              <button className="mt-5 w-full py-3 rounded-full bg-[#715800] text-white font-semibold shadow-md active:scale-95 transition">
                Join Event
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
