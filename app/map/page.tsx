"use client";
import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, X } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import RealMap, { MapRef } from "@/components/map/RealMap";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { DEFAULT_EVENTS, Event } from "@/lib/events";

type FilterType = "all" | "upcoming" | "ongoing" | "past";
type KindType = "all" | "event" | "activity";

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
  const [activeKind, setActiveKind] = useState<KindType>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());

  const mapRef = useRef<MapRef>(null);
  const userLocation = { lat: 4.819, lng: 7.038 };

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleShare = async (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Kivo!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const filteredEvents = useMemo(() => {
    return DEFAULT_EVENTS.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ? true : event.status === activeFilter;
      const matchesKind =
        activeKind === "all" ? true : event.type === activeKind;

      return matchesSearch && matchesFilter && matchesKind;
    });
  }, [search, activeFilter, activeKind]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <OnboardingFlow />

      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        {/* MOBILE TOP BAR (Kept for search functionality) */}
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white/95 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between gap-2">
          <div className="font-bold text-lg text-[#715800]">Kivo</div>
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search local..."
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
                  <hr className="border-gray-100" />
                  <Link
                    href="/auth/signin"
                    className="font-medium text-gray-600"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="font-medium text-gray-600"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* COMPACT FLOATING FILTERS */}
        <div className="fixed top-[70px] md:top-[100px] left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-md flex flex-col gap-3">
          {/* Activity vs Event Pill */}
          <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/20 self-center">
            {(["all", "event", "activity"] as KindType[]).map((kind) => (
              <button
                key={kind}
                onClick={() => setActiveKind(kind)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                  activeKind === kind
                    ? "bg-[#715800] text-white shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>

          {/* Status Filter Bar */}
          <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-2 border border-white/20">
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

        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          filteredEvents={filteredEvents}
        />

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
            onDragEnd={(_, info) => {
              if (info.offset.y < -40) setDrawerOpen(true);
              if (info.offset.y > 40) setDrawerOpen(false);
            }}
            className="fixed bottom-[80px] left-0 w-full bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[50] border-t border-gray-100"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3" />
            <div className="px-5 pb-6">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                <h3 className="font-bold text-gray-900">Things near you</h3>
                <span className="text-[10px] font-black text-[#715800] bg-[#715800]/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {drawerOpen ? "Hide" : "Show All"}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelected(event);
                      mapRef.current?.flyTo({ lat: event.lat, lng: event.lng });
                    }}
                    className="flex-shrink-0 w-[280px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative cursor-pointer active:scale-95 transition"
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="absolute -top-1 -left-1 bg-white shadow-sm px-1.5 py-0.5 rounded border border-gray-50 text-[8px] font-black uppercase text-[#715800]">
                          {event.category}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden flex-1">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {event.emoji} {event.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 truncate mt-1">
                          👥 {event.attendees} •{" "}
                          {getDistance(
                            userLocation.lat,
                            userLocation.lng,
                            event.lat,
                            event.lng,
                          )}
                          km
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelected(null);
              }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[40px] shadow-2xl z-[100] p-6 pb-12 max-h-[92vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-3 mr-3">
                      {selected.participantImages.slice(0, 4).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                          alt="User"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                      +{selected.attendees - selected.participantImages.length}{" "}
                      going
                    </span>
                  </div>
                  <h2 className="font-black text-2xl text-gray-900 leading-tight">
                    {selected.emoji} {selected.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShare(e, selected)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={(e) => toggleLike(e, selected.id)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Heart
                      size={18}
                      className={
                        likedEvents.has(selected.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <img
                src={selected.image}
                className="w-full h-56 object-cover rounded-[28px] mb-6 shadow-sm"
                alt="Cover"
              />
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Entry Fee
                  </p>
                  <p
                    className={`text-sm font-black ${selected.isFree ? "text-green-600" : "text-gray-900"}`}
                  >
                    {selected.isFree ? "FREE" : selected.price}
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Category
                  </p>
                  <p className="text-sm font-black text-gray-900 capitalize">
                    {selected.category}
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {selected.description}
                </p>
              </div>
              <button className="w-full py-5 bg-[#715800] text-white font-black rounded-3xl shadow-xl shadow-[#715800]/30 active:scale-95 transition-all">
                {selected.isFree
                  ? `Join ${selected.type}`
                  : `Grab Ticket (${selected.price})`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
