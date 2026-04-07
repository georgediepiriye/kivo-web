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

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function MapPage() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true); // OPEN BY DEFAULT
  const mapRef = useRef<MapRef>(null);

  const userLocation = { lat: 4.819, lng: 7.038 };

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white/95 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-bold text-lg text-[#715800]">Kivo</div>
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search local events..."
              className="w-full px-4 py-2 rounded-full bg-gray-100 text-sm outline-none border border-transparent focus:border-[#715800]/20"
            />
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
          >
            ☰
          </button>
        </div>

        {/* DRAWER MENU */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/40 z-[80]"
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed top-0 left-0 h-full w-64 bg-white z-[85] shadow-xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-xl">Menu</span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-6">
                  <Link href="/" className="font-medium text-gray-600">
                    Home
                  </Link>
                  <Link href="/map" className="font-bold text-[#715800]">
                    Discover
                  </Link>
                  <Link href="/feed" className="font-medium text-gray-600">
                    Feed
                  </Link>
                  <Link href="/profile" className="font-medium text-gray-600">
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
            className="w-full px-5 py-3 rounded-full bg-white shadow-xl outline-none text-sm border border-gray-100"
          />
        </div>

        {/* FILTER BAR */}
        <div className="fixed top-[70px] md:top-[140px] left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-md">
          <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-lg rounded-2xl p-2 border border-white/20">
            {(["all", "upcoming", "ongoing", "past"] as FilterType[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl relative transition ${activeFilter === status ? "bg-black/5" : ""}`}
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
                  <span className="text-[10px] font-bold capitalize">
                    {status}
                  </span>
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
          <motion.button
            animate={{ bottom: drawerOpen ? 260 : 160 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => mapRef.current?.flyToUser()}
            className="absolute right-4 z-[30] bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-xl active:scale-90 transition"
          >
            📍
          </motion.button>
        )}

        {/* NEAR YOU DRAWER */}
        {!selected && (
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: drawerOpen ? "0%" : "75%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              if (info.offset.y < -40) setDrawerOpen(true);
              if (info.offset.y > 40) setDrawerOpen(false);
            }}
            className="fixed bottom-[80px] left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[50] border-t border-gray-100 cursor-grab active:cursor-grabbing"
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
            <div className="px-5 pb-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                <h3 className="font-bold text-gray-900">
                  Things happening near you
                </h3>
                <span className="text-xs font-bold text-[#715800] bg-[#715800]/5 px-3 py-1 rounded-full">
                  {drawerOpen ? "Hide" : "Show All"}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                {filteredEvents.map((event) => {
                  const dist = getDistance(
                    userLocation.lat,
                    userLocation.lng,
                    event.lat,
                    event.lng,
                  );
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(event);
                        mapRef.current?.flyTo({
                          lat: event.lat,
                          lng: event.lng,
                        });
                      }}
                      className="flex-shrink-0 w-[280px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative cursor-pointer active:scale-95 transition"
                    >
                      {event.id % 2 === 0 && (
                        <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          TRENDING
                        </div>
                      )}
                      <div className="flex gap-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex flex-col justify-center overflow-hidden">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {event.emoji} {event.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate mt-1">
                            Ada George • {dist}km away
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* SELECTION MODAL */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) setSelected(null);
              }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[40px] shadow-2xl z-[100] p-6 pb-12"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="font-black text-2xl text-gray-900">
                    {selected.emoji} {selected.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Old GRA, Port Harcourt
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <img
                src={selected.image}
                className="w-full h-52 object-cover rounded-[24px] mb-6 shadow-sm"
              />
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Distance
                  </p>
                  <p className="text-sm font-bold">
                    {getDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selected.lat,
                      selected.lng,
                    )}{" "}
                    km
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Status
                  </p>
                  <p
                    className="text-sm font-bold capitalize"
                    style={{ color: statusColors[selected.status] }}
                  >
                    {selected.status}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                {selected.description}
              </p>
              <button className="w-full py-4 bg-[#715800] text-white font-black rounded-2xl shadow-xl shadow-[#715800]/30 active:scale-95 transition">
                Grab a Ticket
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
      <Footer />
    </div>
  );
}
