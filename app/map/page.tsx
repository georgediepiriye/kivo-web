/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  Loader2,
  LogOut,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react"; // Added Icons
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import RealMap, { MapRef } from "@/components/map/RealMap";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { Event } from "@/lib/events";

type FilterType = "all" | "upcoming" | "ongoing" | "past";
type KindType = "all" | "event" | "activity";

const statusColors: Record<Exclude<FilterType, "all">, string> = {
  upcoming: "#facc15",
  ongoing: "#10b981",
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
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeKind, setActiveKind] = useState<KindType>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Track auth state locally
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const userLocation = { lat: 4.819, lng: 7.038 };

  const navLinks = [
    { href: "/map", label: "Map" },
    { href: "/discover", label: "Discover" },
    { href: "/create", label: "Add Event" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
  ];

  useEffect(() => {
    // Check auth on mount
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/V1/events?limit=100`,
        );
        const result = await response.json();

        if (result.status === "success") {
          const formattedEvents = result.data.events.map((e: any) => ({
            ...e,
            id: e._id,
            lat: e.location.coordinates[1],
            lng: e.location.coordinates[0],
            organizerName: e.organizer?.name || "Kivo Host",
            organizerImage:
              e.organizer?.image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${e._id}`,
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error("Kivo API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();

    return events
      .map((event) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();

        let timeStatus: FilterType = "all";

        if (now < start) {
          timeStatus = "upcoming";
        } else if (now >= start && now <= end) {
          timeStatus = "ongoing";
        } else {
          timeStatus = "past";
        }

        return { ...event, timeStatus };
      })
      .filter((event) => {
        const matchesSearch = event.title
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesFilter =
          activeFilter === "all" ? true : event.timeStatus === activeFilter;

        const matchesKind =
          activeKind === "all"
            ? true
            : activeKind === "event"
              ? event.type === "showcase"
              : event.type === "activity";

        return matchesSearch && matchesFilter && matchesKind;
      });
  }, [events, search, activeFilter, activeKind]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // Update state immediately
    setMenuOpen(false);
    router.push("/auth/signin");
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleFollow = (userName: string) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userName)) newSet.delete(userName);
      else newSet.add(userName);
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <OnboardingFlow />
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
          >
            <div className="font-black text-3xl text-[#715800] mb-4 tracking-tighter italic">
              Kivo
            </div>
            <Loader2 className="animate-spin text-gray-200" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 w-full h-screen bg-white z-[150] md:hidden flex flex-col"
          >
            <div className="h-24 px-8 flex items-center justify-between">
              <span className="text-2xl font-black text-[#715800] tracking-tighter">
                Kivo
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center bg-gray-50 rounded-2xl text-[#715800]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-8">
                Menu
              </p>
              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.href}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-5 border-b border-gray-50 hover:px-2 transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-[#715800]">
                        {link.label}
                      </span>
                      <ChevronRight className="text-gray-300 group-hover:text-[#715800] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* DYNAMIC AUTH SECTION */}
              <div className="mt-12 space-y-4">
                {isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-5 rounded-[24px] bg-red-50 text-red-500 font-black text-center text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full py-5 rounded-[24px] bg-black text-white font-black text-center text-lg shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={20} /> Create Account
                    </Link>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full py-5 rounded-[24px] bg-gray-50 text-gray-900 font-black text-center text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={20} /> Sign In
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Kivo Social Discovery Hub
                </p>
                <p className="text-xs text-gray-300 font-medium italic">
                  Made for Port Harcourt.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white/95 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between gap-2 border-b border-gray-100">
          <div className="font-bold text-lg text-[#715800]">Kivo</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search local..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm border-transparent focus:border-[#715800]/20 outline-none"
          />
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center rounded-full bg-gray-100 justify-center text-[#715800]"
          >
            ☰
          </button>
        </div>

        <div className="fixed top-[70px] md:top-[100px] left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-md flex flex-col gap-3">
          <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-full shadow-lg self-center">
            {(["all", "event", "activity"] as KindType[]).map((kind) => (
              <button
                key={kind}
                onClick={() => setActiveKind(kind)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${activeKind === kind ? "bg-gray-900 text-white" : "text-gray-400"}`}
              >
                {kind}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-2 border border-white/20">
            {(["all", "upcoming", "ongoing", "past"] as FilterType[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl transition ${activeFilter === status ? "bg-black/5" : ""}`}
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
          <motion.div
            animate={{ y: drawerOpen ? "0%" : "75%" }}
            className="fixed bottom-[80px] left-0 w-full bg-white rounded-t-[32px] shadow-2xl z-[50] border-t border-gray-100"
          >
            <div
              className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 cursor-pointer"
              onClick={() => setDrawerOpen(!drawerOpen)}
            />
            <div className="px-5 pb-6">
              <h3 className="font-bold text-gray-900 mb-4">Things near you</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => {
                      setSelected(event);
                      mapRef.current?.flyTo({
                        lat: (event as any).lat,
                        lng: (event as any).lng,
                      });
                    }}
                    className="flex-shrink-0 w-[280px] bg-white rounded-2xl p-3 border border-gray-100 shadow-sm cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <img
                        src={event.image}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-sm text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                          By {(event as any).organizerName}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          <span className="capitalize">{event.category}</span> •
                          👥 {event.attendees} •{" "}
                          {getDistance(
                            userLocation.lat,
                            userLocation.lng,
                            (event as any).lat,
                            (event as any).lng,
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

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[40px] shadow-2xl z-[100] p-6 pb-12 max-h-[92vh] overflow-y-auto"
            >
              <div
                className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"
                onClick={() => setSelected(null)}
              />
              <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <img
                    src={(selected as any).organizerImage}
                    className="h-10 w-10 rounded-full object-cover"
                    alt=""
                  />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                      Posted By
                    </p>
                    <p className="font-bold text-sm text-gray-900">
                      {(selected as any).organizerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow((selected as any).organizerName)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition ${followedUsers.has((selected as any).organizerName) ? "bg-gray-200 text-gray-600" : "bg-[#715800] text-white"}`}
                >
                  {followedUsers.has((selected as any).organizerName)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                    👥 {selected.attendees} going
                  </span>
                  <h2 className="font-black text-2xl text-gray-900 mt-3">
                    {selected.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => toggleLike(e, selected._id)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                  >
                    <Heart
                      size={18}
                      className={
                        likedEvents.has(selected._id)
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
                alt=""
              />
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Entry Fee
                  </p>
                  <p
                    className={`text-sm font-black ${selected.isFree ? "text-green-600" : "text-gray-900"}`}
                  >
                    {selected.isFree
                      ? "FREE"
                      : `₦${selected.price.toLocaleString()}`}
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Category
                  </p>
                  <p className="text-sm font-black text-gray-900 capitalize">
                    {selected.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/discover/${selected.id}`)}
                className="w-full py-5 bg-[#715800] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                {selected.type === "activity"
                  ? "View Activity"
                  : "View Details"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
