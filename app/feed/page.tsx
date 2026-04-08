/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Filter,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import { DEFAULT_EVENTS } from "@/lib/events";
import { EVENT_CATEGORIES } from "@/lib/categories";
import EventCard from "@/components/cards/EventCard";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

const ITEMS_PER_PAGE = 5;
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

  // Basic Filter States
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [dist, setDist] = useState(25);
  const [page, setPage] = useState(1);

  // Advanced Filter States
  const [dateFilter, setDateFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "ongoing" | "past"
  >("all");
  const [privacyFilter, setPrivacyFilter] = useState<
    "all" | "public" | "private"
  >("all");

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    const now = new Date();

    return DEFAULT_EVENTS.filter((e) => {
      // 1. Search & Category
      const matchSearch = e.title.toLowerCase().includes(searchLower);
      const matchCat = activeCat === "all" || e.category === activeCat;

      // 2. Distance
      const distanceValue = parseFloat(
        getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng),
      );
      const matchDist = distanceValue <= dist;

      // 3. Price
      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "free" ? e.isFree : !e.isFree);

      // 4. Date
      const matchDate = !dateFilter || e.date === dateFilter;

      // 5. Privacy
      const matchPrivacy =
        privacyFilter === "all" ||
        (privacyFilter === "public" ? e.isPublic : !e.isPublic);

      // 6. Status Logic
      const eventDate = new Date(e.date);
      let status: "upcoming" | "ongoing" | "past" = "upcoming";
      if (eventDate.toDateString() === now.toDateString()) status = "ongoing";
      else if (eventDate < now) status = "past";
      const matchStatus = statusFilter === "all" || statusFilter === status;

      return (
        matchSearch &&
        matchCat &&
        matchDist &&
        matchPrice &&
        matchDate &&
        matchPrivacy &&
        matchStatus
      );
    });
  }, [
    search,
    activeCat,
    dist,
    dateFilter,
    priceFilter,
    statusFilter,
    privacyFilter,
  ]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const current = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleShare = async (e: any, event: any) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this vibe on Kivo: ${event.title}`,
          url: `${window.location.origin}/feed/${event.id}`,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 px-4 max-w-2xl mx-auto w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">
              Activity Feed
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {filtered.length} Events found within {dist}km radius
            </p>
          </div>
        </header>

        {/* --- FILTERS SECTION --- */}
        <div className="space-y-4 mb-8">
          {/* Search & Date */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search events..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-[#715800]/10 transition-all font-medium"
              />
            </div>
            <div className="relative">
              <CalendarIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#715800]"
                size={18}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-11 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none text-sm font-bold text-[#715800]"
              />
            </div>
          </div>

          {/* Quick Select Advanced Filters */}
          <div className="grid grid-cols-3 gap-2">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-tighter text-gray-500 outline-none focus:border-[#715800]"
            >
              <option value="all">Any Price</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Entry</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-tighter text-gray-500 outline-none focus:border-[#715800]"
            >
              <option value="all">Any Status</option>
              <option value="ongoing">Happening Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Moves</option>
            </select>

            <select
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value as any)}
              className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-tighter text-gray-500 outline-none focus:border-[#715800]"
            >
              <option value="all">Any Visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Radius Slider */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
              <span>Radius</span>
              <span className="text-[#715800]">{dist}km</span>
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
              className="w-full accent-[#715800] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Categories Scroll */}
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

        {/* --- LIST SECTION --- */}
        <div className="space-y-6 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {current.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative group cursor-pointer"
                onClick={() => router.push(`/feed/${e.id}`)}
              >
                {/* Floating Actions */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation(); /* Toggle Like */
                    }}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-red-500 hover:scale-110 active:scale-90 transition"
                  >
                    <Heart size={18} />
                  </button>
                  <button
                    onClick={(ev) => handleShare(ev, e)}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg text-[#715800] hover:scale-110 active:scale-90 transition"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                <EventCard
                  title={e.title}
                  image={e.image}
                  category={e.category}
                  location={`${getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng)}km away`}
                  time={e.date}
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
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <Filter className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-medium">
                No vibes found matching your filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCat("all");
                  setDist(50);
                  setDateFilter("");
                }}
                className="mt-4 text-[#715800] font-bold text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-20">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm disabled:opacity-20 transition active:scale-90"
            >
              ←
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm disabled:opacity-20 transition active:scale-90"
            >
              →
            </button>
          </div>
        )}

        {/* CTA Section */}
        <section className="bg-gray-900 p-10 rounded-[48px] text-center text-white mb-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#715800]/20 blur-3xl rounded-full" />
          <h2 className="text-2xl font-black mb-2 tracking-tight">
            Can't find a vibe?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-[220px] mx-auto">
            Start your own activity and broadcast it to everyone nearby.
          </p>
          <button
            onClick={() => router.push("/create")}
            className="w-full py-5 bg-white text-black font-black rounded-[24px] active:scale-95 transition-all shadow-lg hover:bg-gray-100"
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
