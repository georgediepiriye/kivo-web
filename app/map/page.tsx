"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import RealMap, { MapRef } from "@/components/map/RealMap";
import { DEFAULT_EVENTS, Event } from "@/lib/events";

type FilterType = "all" | "upcoming" | "ongoing" | "past";

const statusColors: Record<Exclude<FilterType, "all">, string> = {
  upcoming: "#10b981",
  ongoing: "#facc15",
  past: "#9ca3af",
};

const allFilterColor = "#8b5cf6";

export default function MapPage() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const mapRef = useRef<MapRef>(null);

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
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white/95 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-bold text-lg">Kivo</div>
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to do?"
              className="w-full px-3 py-2 rounded-full bg-gray-100 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
          >
            ☰
          </button>
        </div>

        {/* DRAWER */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/40 z-[60]"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="fixed top-0 left-0 h-full w-64 bg-white z-[65] shadow-xl flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-4 border-b">
                  <span className="font-semibold text-lg">Menu</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex justify-between items-center">
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="font-medium"
                    >
                      Home
                    </Link>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <Link href="/map" onClick={() => setMenuOpen(false)}>
                    Discover
                  </Link>
                  <Link href="/feed" onClick={() => setMenuOpen(false)}>
                    Feed
                  </Link>
                  <Link href="/chat" onClick={() => setMenuOpen(false)}>
                    AI Assistant
                  </Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DESKTOP SEARCH */}
        <div className="hidden md:block fixed top-[80px] left-1/2 -translate-x-1/2 z-[50] w-[85%] max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What do you want to do?"
            className="w-full px-4 py-3 rounded-full bg-white shadow-lg outline-none text-sm"
          />
        </div>

        {/* FILTER */}
        <div className="fixed top-[70px] md:top-[140px] left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-md">
          <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-lg rounded-2xl p-2">
            {(["all", "upcoming", "ongoing", "past"] as FilterType[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className="flex-1 flex flex-col items-center py-2 relative"
                >
                  <span
                    className="w-2 h-2 rounded-full mb-1"
                    style={{
                      backgroundColor:
                        status === "all"
                          ? allFilterColor
                          : statusColors[status],
                    }}
                  />
                  <span className="text-lg">
                    {status === "upcoming"
                      ? "📅"
                      : status === "ongoing"
                        ? "🔥"
                        : status === "past"
                          ? "📁"
                          : "🌐"}
                  </span>
                  <span className="text-[11px] capitalize">{status}</span>
                  {activeFilter === status && (
                    <span className="absolute inset-0 rounded-xl bg-black/10" />
                  )}
                </button>
              ),
            )}
          </div>
        </div>

        {/* MAP */}
        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          filteredEvents={filteredEvents}
        />

        {/* LOCATION BUTTON */}
        {!selected && (
          <button
            onClick={() => mapRef.current?.flyToUser()}
            className="absolute right-4 bottom-[160px] z-[30] bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
          >
            📍
          </button>
        )}

        {/* EVENT SHEET WITH CLOSE BUTTON */}
        {selected && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            className="absolute bottom-[90px] left-0 w-full bg-white rounded-t-3xl shadow-2xl z-[60]"
          >
            <div className="p-5 relative">
              {/* X button at top-right */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition text-lg"
              >
                ✕
              </button>

              <h2 className="font-bold">{selected.title}</h2>
              <img src={selected.image} className="mt-3 rounded-xl" />
              <button className="mt-4 w-full py-3 bg-[#715800] text-white rounded-full">
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
