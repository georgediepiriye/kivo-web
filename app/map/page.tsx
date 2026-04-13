/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  X,
  Loader2,
  LogOut,
  ChevronRight,
  LogIn,
  UserPlus,
  Search,
  LocateFixed,
  Calendar,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/NavBar"; // Fixed casing: NavBar
import MobileNav from "@/components/layout/MobileNav";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { Event } from "@/lib/events";

const RealMap = dynamic(() => import("@/components/map/RealMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  ),
});

type FilterType = "all" | "upcoming" | "ongoing" | "past";
type KindType = "all" | "event" | "activity";

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  // UI State
  const [selected, setSelected] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeKind, setActiveKind] = useState<KindType>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  });

  // TanStack Query for Data Fetching & Caching
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/V1/events?limit=100`,
      );
      const result = await response.json();

      if (result.status !== "success") throw new Error("Fetch failed");

      return result.data.events.map((e: any) => ({
        ...e,
        id: e._id,
        lat: e.location.coordinates[1],
        lng: e.location.coordinates[0],
        organizerName: e.organizer?.name || "Kivo Host",
        organizerImage:
          e.organizer?.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${e._id}`,
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes
  });

  const navLinks = useMemo(
    () => [
      { href: "/map", label: "Map" },
      { href: "/discover", label: "Discover" },
      { href: "/create", label: "Add Event" },
      { href: "/chat", label: "AI Assistant" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact Us" },
    ],
    [],
  );

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    const query = search.toLowerCase();

    return events
      .map((event: any) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        const timeStatus: FilterType =
          now < start ? "upcoming" : now <= end ? "ongoing" : "past";
        return { ...event, timeStatus };
      })
      .filter((event: any) => {
        const matchesSearch =
          !search || event.title.toLowerCase().includes(query);
        const matchesFilter =
          activeFilter === "all" || event.timeStatus === activeFilter;
        const matchesKind =
          activeKind === "all"
            ? true
            : activeKind === "event"
              ? event.type === "showcase"
              : event.type === "activity";
        return matchesSearch && matchesFilter && matchesKind;
      });
  }, [events, search, activeFilter, activeKind]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/auth/signin");
  }, [router]);

  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const toggleFollow = useCallback((userName: string) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userName)) newSet.delete(userName);
      else newSet.add(userName);
      return newSet;
    });
  }, []);

  const handleLocateUser = useCallback(() => {
    const saved = localStorage.getItem("user_coords");

    if (saved) {
      try {
        const coords = JSON.parse(saved);
        if (
          coords &&
          typeof coords.lat === "number" &&
          typeof coords.lng === "number" &&
          !isNaN(coords.lat)
        ) {
          mapRef.current?.flyTo({
            lng: coords.lng,
            lat: coords.lat,
          });
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved coords", e);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current?.flyTo({
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
          });
        },
        () => {
          mapRef.current?.flyTo({ lng: 7.0498, lat: 4.8156 });
        },
      );
    }
  }, []);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const eventDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let dateDisplay;
    if (diffDays === 0) {
      dateDisplay = "Today";
    } else if (diffDays === 1) {
      dateDisplay = "Tomorrow";
    } else {
      dateDisplay = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return {
      date: dateDisplay,
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 antialiased">
      <OnboardingFlow />

      <style jsx global>{`
        .mapboxgl-ctrl-geolocate {
          display: none !important;
        }
      `}</style>

      <AnimatePresence>
        {isLoading && (
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
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 w-full h-full bg-white z-[150] md:hidden overflow-y-auto"
          >
            <div className="min-h-screen flex flex-col pb-24">
              <div className="h-24 px-8 flex items-center justify-between shrink-0">
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

              <div className="px-8 flex-1">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between py-5 border-b border-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="text-4xl font-black tracking-tighter text-gray-900">
                          {link.label}
                        </span>
                        <ChevronRight className="text-gray-300" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 space-y-4 pb-10">
                  {isLoggedIn ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full py-5 rounded-[24px] bg-red-50 text-red-500 font-black flex items-center justify-center gap-3"
                    >
                      <LogOut size={20} /> Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/auth/signup"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full py-5 rounded-[24px] bg-black text-white font-black text-center text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="flex-1 relative">
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white/60 backdrop-blur-lg px-3 py-2 flex items-center gap-2 border-b border-gray-100">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search local..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-100/80 text-xs border-transparent outline-none font-bold"
            />
          </div>
          <div className="flex bg-gray-100/80 p-0.5 rounded-xl border border-gray-200/50">
            {(["event", "activity"] as KindType[]).map((kind) => (
              <button
                key={kind}
                onClick={() =>
                  setActiveKind(activeKind === kind ? "all" : kind)
                }
                className={`px-3 py-1.5 rounded-[10px] text-[9px] font-black uppercase transition-all ${
                  activeKind === kind
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 flex items-center rounded-xl bg-white/80 justify-center text-[#715800] border border-gray-100 shadow-sm font-black"
          >
            ☰
          </button>
        </div>

        <div className="fixed top-[58px] md:top-[100px] left-1/2 -translate-x-1/2 z-[40] w-[94%] max-w-sm">
          <div className="flex justify-between items-center bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-1 border border-white/20">
            {(["all", "upcoming", "ongoing", "past"] as FilterType[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                    activeFilter === status
                      ? "bg-white shadow-sm"
                      : "opacity-60"
                  }`}
                >
                  <span className="text-sm">
                    {status === "upcoming"
                      ? "📅"
                      : status === "ongoing"
                        ? "🔥"
                        : status === "past"
                          ? "📁"
                          : "🌐"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter">
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

        <div className="absolute bottom-36 right-4 z-[40] md:bottom-10 md:right-10">
          <button
            onClick={handleLocateUser}
            className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-[#715800] border border-white/50 active:scale-95 transition-all"
          >
            <LocateFixed size={22} />
          </button>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[40px] shadow-2xl z-[100] p-6 pb-12 max-h-[85vh] overflow-y-auto"
            >
              <div
                className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer"
                onClick={() => setSelected(null)}
              />

              <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <Image
                      src={(selected as any).organizerImage}
                      alt="Org"
                      fill
                      sizes="40px"
                      className="rounded-full object-cover"
                    />
                  </div>
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
                  className={`px-4 py-2 rounded-full text-xs font-black transition ${
                    followedUsers.has((selected as any).organizerName)
                      ? "bg-gray-200 text-gray-600"
                      : "bg-[#715800] text-white"
                  }`}
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

              <div className="relative w-full h-52 mb-6">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover rounded-[28px] shadow-sm"
                />
              </div>

              {/* DATE AND TIME SECTION */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar size={18} className="text-[#715800]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Date
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {formatDateTime(selected.startDate).date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Clock size={18} className="text-[#715800]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Time
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {(() => {
                        const start = new Date(selected.startDate).getTime();
                        const now = new Date().getTime();
                        const diffMins = Math.floor(
                          (start - now) / (1000 * 60),
                        );

                        if (diffMins > 0 && diffMins <= 60) {
                          return `Starts in ${diffMins}m`;
                        }
                        if (
                          diffMins <= 0 &&
                          new Date(selected.endDate).getTime() > now
                        ) {
                          return "Happening Now";
                        }
                        return formatDateTime(selected.startDate).time;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                    Entry Fee
                  </p>
                  <p
                    className={`text-sm font-black ${
                      selected.isFree ? "text-green-600" : "text-gray-900"
                    }`}
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
