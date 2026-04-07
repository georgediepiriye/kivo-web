/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_EVENTS } from "@/lib/events";
import { EVENT_CATEGORIES } from "@/lib/categories";
import EventCard from "@/components/cards/EventCard";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

const ITEMS_PER_PAGE = 5;

// ✅ FIX 1: Move constants and helper functions OUTSIDE the component.
// This prevents them from being "unstable" and breaking the React Compiler.
const USER_LOCATION = { lat: 4.819, lng: 7.038 };

const getKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function FeedPage() {
  const router = useRouter();

  // State
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [dist, setDist] = useState(25);
  const [page, setPage] = useState(1);

  // ✅ FIX 2: The compiler can now safely optimize this useMemo
  // because USER_LOCATION is a stable reference from outside the scope.
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();

    return DEFAULT_EVENTS.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(searchLower);
      const matchCat = activeCat === "all" || e.category === activeCat;

      // Calculate distance once per filter item
      const distanceValue = parseFloat(
        getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng),
      );
      const matchDist = distanceValue <= dist;

      return matchSearch && matchCat && matchDist;
    });
  }, [search, activeCat, dist]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const current = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-black mb-8 tracking-tighter">
          Activity Feed
        </h1>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events..."
            className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
          />

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
              <span>Radius</span>
              <span className="text-black">{dist}km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={dist}
              onChange={(e) => {
                setDist(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-black h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => {
                setActiveCat("all");
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                activeCat === "all"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-400 border-gray-100"
              }`}
            >
              All
            </button>
            {Object.entries(EVENT_CATEGORIES).map(([k, v]: any) => (
              <button
                key={k}
                onClick={() => {
                  setActiveCat(k);
                  setPage(1);
                }}
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  activeCat === k
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-400 border-gray-100"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-6 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {current.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => router.push(`/feed/${e.id}`)}
                className="cursor-pointer"
              >
                <EventCard
                  title={e.title}
                  image={e.image}
                  category={e.category}
                  location={`${getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng)}km away`}
                  time={e.status.toUpperCase()}
                  buttonText={
                    e.isFree ? "Free Join" : (e.price ?? "View Details")
                  }
                  attendees={e.attendees}
                  participantImages={e.participantImages}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {current.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 font-medium">
                No vibes found in this range.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-20">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-4 bg-white rounded-2xl border border-gray-100 disabled:opacity-20 transition active:scale-90"
            >
              ←
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-4 bg-white rounded-2xl border border-gray-100 disabled:opacity-20 transition active:scale-90"
            >
              →
            </button>
          </div>
        )}

        <section className="bg-black p-10 rounded-[48px] text-center text-white mb-20 shadow-2xl">
          <h2 className="text-2xl font-black mb-2 tracking-tight">
            Can't find a vibe?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-[200px] mx-auto">
            Start your own activity and invite people nearby.
          </p>
          <button
            onClick={() => router.push("/create")}
            className="w-full py-4 bg-white text-black font-black rounded-3xl active:scale-95 transition-all shadow-lg"
          >
            Create Activity
          </button>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
