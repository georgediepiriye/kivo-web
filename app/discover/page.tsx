/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Briefcase,
  Music,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image"; // Added Image import
import { EVENT_CATEGORIES } from "@/lib/categories";
import EventCard from "@/components/cards/EventCard";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

const ITEMS_PER_PAGE = 6;
const USER_LOCATION = { lat: 4.819, lng: 7.038 };

// HELPER: Calculate Distance
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

// HELPER: Date Ranges for Quick Filters
const getDateRange = (filter: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    };
  }
  if (filter === "tomorrow") {
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    return {
      start: tomorrow,
      end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
    };
  }
  if (filter === "weekend") {
    const day = today.getDay();
    const diffToFriday = day === 0 ? 5 : 5 - day;
    const friday = new Date(
      today.getTime() +
        (diffToFriday > 0 ? diffToFriday : 0) * 24 * 60 * 60 * 1000,
    );
    const sunday = new Date(friday.getTime() + 3 * 24 * 60 * 60 * 1000);
    return { start: friday, end: sunday };
  }
  return null;
};

// HELPER: Format Date and Time
const formatEventTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DiscoverPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [dist, setDist] = useState(25);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "upcoming" | "ongoing" | "past"
  >("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/V1/events?limit=100`,
        );
        const result = await response.json();

        if (result.status === "success") {
          const formatted = result.data.events.map((e: any) => ({
            ...e,
            id: e._id,
            lat: e.location.coordinates[1],
            lng: e.location.coordinates[0],
            date: new Date(e.startDate).toISOString().split("T")[0],
            organizerName: e.organizer?.name || "Kivo Host",
            organizerImage:
              e.organizer?.image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${e._id}`,
          }));
          setEvents(formatted);
        }
      } catch (error) {
        console.error("Kivo Discover Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    const now = new Date();

    return events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(searchLower);
      const matchCat = activeCat === "all" || e.category === activeCat;
      const distanceValue = parseFloat(
        getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng),
      );
      const matchDist = distanceValue <= dist;
      const matchPrice =
        priceFilter === "all" ||
        (priceFilter === "free" ? e.isFree : !e.isFree);

      // Date Filtering Logic
      let matchDate = true;
      if (dateFilter) {
        const eventDate = new Date(e.startDate);
        const range = getDateRange(dateFilter);
        matchDate = range
          ? eventDate >= range.start && eventDate < range.end
          : e.date === dateFilter;
      }

      const startDate = new Date(e.startDate);
      const endDate = new Date(e.endDate);
      let status: "upcoming" | "ongoing" | "past" = "upcoming";
      if (now < startDate) status = "upcoming";
      else if (now >= startDate && now <= endDate) status = "ongoing";
      else if (now > endDate) status = "past";

      const matchStatus = statusFilter === "all" || statusFilter === status;

      return (
        matchSearch &&
        matchCat &&
        matchDist &&
        matchPrice &&
        matchDate &&
        matchStatus
      );
    });
  }, [events, search, activeCat, dist, dateFilter, priceFilter, statusFilter]);

  const current = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const clearFilters = () => {
    setSearch("");
    setActiveCat("all");
    setDist(25);
    setDateFilter("");
    setPriceFilter("all");
    setStatusFilter("all");
  };

  const trendingEvents = useMemo(
    () => [...events].sort((a, b) => b.attendees - a.attendees).slice(0, 4),
    [events],
  );
  const techEvents = useMemo(
    () =>
      events
        .filter((e) => e.category === "tech" || e.category === "business")
        .slice(0, 4),
    [events],
  );
  const musicSpotlight = useMemo(
    () =>
      events
        .filter((e) => e.category === "music" || e.category === "entertainment")
        .slice(0, 2),
    [events],
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col overflow-x-hidden">
      <Navbar />

      <section className="pt-28 md:pt-36 pb-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Live in Port Harcourt
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.85]">
                Find your next <br />{" "}
                <span className="text-[#715800]">Move.</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900">
                  {filtered.length} results
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  within {dist}km
                </p>
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-black/10"
              >
                {isFilterOpen ? (
                  <X size={16} />
                ) : (
                  <SlidersHorizontal size={16} />
                )}
                {isFilterOpen ? "Close" : "Filters"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY CATEGORY BAR */}
      <div
        className={`sticky top-[72px] md:top-[80px] z-[40] bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all ${
          isScrolled ? "shadow-md py-2" : "py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCat === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"}`}
            >
              All Vibes
            </button>
            {Object.entries(EVENT_CATEGORIES).map(([k, v]: any) => (
              <button
                key={k}
                onClick={() => setActiveCat(k)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCat === k ? "bg-[#715800] text-white border-[#715800]" : "bg-white text-gray-400 border-gray-100"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 max-w-6xl mx-auto w-full py-8 md:py-12">
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 md:p-8 bg-gray-50 rounded-[32px] border border-gray-100 shadow-inner">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">
                    Keywords
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                      size={18}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Concerts, parties, lounges..."
                      className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#715800]/20 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">
                    When
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {["today", "tomorrow", "weekend"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setDateFilter(dateFilter === opt ? "" : opt)
                          }
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${dateFilter === opt ? "bg-[#715800] text-white border-[#715800]" : "bg-white text-gray-400 border-gray-100"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <CalendarIcon
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${dateFilter && !["today", "tomorrow", "weekend"].includes(dateFilter) ? "text-[#715800]" : "text-gray-300"}`}
                        size={16}
                      />
                      <input
                        type="date"
                        value={
                          ["today", "tomorrow", "weekend"].includes(dateFilter)
                            ? ""
                            : dateFilter
                        }
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#715800]/20 font-bold text-gray-600 uppercase text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block ml-1">
                    Distance ({dist}km)
                  </label>
                  <div className="bg-white px-4 rounded-2xl shadow-sm h-[56px] flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={dist}
                      onChange={(e) => setDist(Number(e.target.value))}
                      className="w-full accent-[#715800] h-1 bg-gray-100 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-3 pt-6 border-t border-gray-200 mt-2">
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="bg-white px-6 py-3 rounded-xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest text-gray-500"
                  >
                    <option value="all">Any Price</option>
                    <option value="free">Free Events</option>
                    <option value="paid">Paid Admission</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-white px-6 py-3 rounded-xl border-none shadow-sm font-black text-[10px] uppercase tracking-widest text-gray-500"
                  >
                    <option value="all">Any Status</option>
                    <option value="ongoing">Happening Now</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl ml-auto"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-[#715800] mb-4" size={40} />
            <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">
              Syncing the city...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
            <AnimatePresence mode="popLayout">
              {current.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div
                    onClick={() => router.push(`/discover/${e.id}`)}
                    className="h-full relative cursor-pointer group rounded-[32px] overflow-hidden bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500"
                  >
                    <EventCard
                      {...e}
                      organizerName={e.organizerName}
                      organizerImage={e.organizerImage}
                      location={`${getKm(USER_LOCATION.lat, USER_LOCATION.lng, e.lat, e.lng)}km away`}
                      time={formatEventTime(e.startDate)}
                      buttonText={
                        e.isFree ? "Free" : `₦${e.price.toLocaleString()}`
                      }
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* HORIZONTAL SECTIONS (The Hot List) */}
        <section className="mt-12 mb-24 overflow-visible">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
              <Flame size={24} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-gray-900">
              The Hot List
            </h2>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6">
            {trendingEvents.map((e) => (
              <div
                key={e.id}
                className="min-w-[280px] sm:min-w-[340px] md:min-w-[400px]"
              >
                <EventCard
                  {...e}
                  category={e.category as any}
                  organizerName={e.organizerName}
                  organizerImage={e.organizerImage}
                  time={formatEventTime(e.startDate)}
                  location="Port Harcourt"
                  buttonText="Join"
                />
              </div>
            ))}
          </div>
        </section>

        {/* LIST SECTION (Professional Moves) */}
        <section className="mb-24 bg-gray-50 -mx-6 px-6 py-16 md:py-20 md:rounded-[64px] border-y md:border border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-gray-900">
                  Professional Moves
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Connect & Grow
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techEvents.map((e) => (
                <div
                  key={e.id}
                  onClick={() => router.push(`/discover/${e.id}`)}
                  className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 relative">
                    <Image
                      src={e.image}
                      fill
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      alt={e.title}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 truncate mb-1 md:text-lg">
                      {e.title}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {formatEventTime(e.startDate)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#715800] group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPOTLIGHT (Music) */}
        <section className="mb-24">
          <div className="bg-gray-900 rounded-[40px] md:rounded-[48px] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#715800] opacity-20 blur-[120px]" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
              <div className="lg:w-1/2">
                <Music
                  className="text-[#715800] mb-6 mx-auto lg:mx-0"
                  size={48}
                />
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                  The Rhythm <br /> of the City.
                </h2>
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  Explore Music <ArrowRight size={16} />
                </button>
              </div>
              <div className="lg:w-1/2 w-full space-y-4">
                {musicSpotlight.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => router.push(`/discover/${e.id}`)}
                    className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-[28px] flex items-center gap-5 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-white/10 relative">
                      <Image
                        src={e.image}
                        fill
                        className="w-full h-full object-cover opacity-80"
                        alt={e.title}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-white text-lg tracking-tight truncate">
                        {e.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Sparkles size={12} className="text-[#715800]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {formatEventTime(e.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
