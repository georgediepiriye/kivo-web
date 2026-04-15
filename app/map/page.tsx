/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useMemo, useCallback } from "react";
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
  AlertCircle,
  Flame,
  Navigation,
  Music,
  Utensils,
  Coffee,
  Sparkles,
  ShoppingBag,
  Palette,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { Event } from "@/lib/events";
import MapGuide from "@/components/onboarding/MapGuide";

const RealMap = dynamic(() => import("@/components/map/RealMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-400" size={32} />
    </div>
  ),
});

type FilterType = "upcoming" | "ongoing";
type KindType = "all" | "event" | "activity";

// Consolidated Categories for better UX
const HOTSPOT_CATEGORIES = [
  { id: "all", label: "All Spots", icon: <Sparkles size={14} /> },
  { id: "dining", label: "Food", icon: <Utensils size={14} /> },
  { id: "nightlife", label: "Social", icon: <Music size={14} /> },
  { id: "cafe", label: "Chill", icon: <Coffee size={14} /> },
  { id: "arts", label: "Creative", icon: <Palette size={14} /> },
  { id: "retail", label: "Shopping", icon: <ShoppingBag size={14} /> },
];

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const [selected, setSelected] = useState<Event | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ongoing");
  const [activeKind, setActiveKind] = useState<KindType>("all");
  const [activeHotspotCat, setActiveHotspotCat] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  });
  const [showGuide, setShowGuide] = useState(() => {
    // Only show automatically if they haven't seen it before
    if (typeof window !== "undefined") {
      return !localStorage.getItem("kivo_map_guided");
    }
    return false;
  });

  const closeGuide = () => {
    localStorage.setItem("kivo_map_guided", "true");
    setShowGuide(false);
  };

  const {
    data: events = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/V1/events?limit=100`,
      );
      if (!response.ok) throw new Error("Network error");
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
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    const query = search.toLowerCase();

    return events
      .map((event: any) => {
        const start = new Date(event.startDate).getTime();
        const end = new Date(event.endDate).getTime();
        const timeStatus =
          now < start ? "upcoming" : now <= end ? "ongoing" : "past";
        return { ...event, timeStatus };
      })
      .filter((event: any) => {
        if (event.timeStatus === "past") return false;

        const matchesSearch =
          !search || event.title.toLowerCase().includes(query);
        const matchesFilter = event.timeStatus === activeFilter;
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
    if (mapRef.current?.flyToUser) {
      mapRef.current.flyToUser();
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          mapRef.current?.flyTo({
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
          });
        });
      }
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
    if (diffDays === 0) dateDisplay = "Today";
    else if (diffDays === 1) dateDisplay = "Tomorrow";
    else {
      dateDisplay = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans text-gray-900 antialiased">
      <OnboardingFlow />
      <AnimatePresence>
        {showGuide && <MapGuide onClose={closeGuide} />}
      </AnimatePresence>
      <style jsx global>{`
        .mapboxgl-ctrl-geolocate {
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-mask {
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(
            to right,
            black 85%,
            transparent 100%
          );
        }
      `}</style>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
          >
            <div className="font-black text-3xl text-gray-900 mb-4 tracking-tighter italic">
              Kivo
            </div>
            <Loader2 className="animate-spin text-gray-200" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[250] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 italic tracking-tighter">
              Connection Lost
            </h3>
            <button
              onClick={() => refetch()}
              className="px-8 py-4 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Retry Connection
            </button>
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
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  Kivo
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center bg-gray-50 rounded-2xl"
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
        <div className="md:hidden fixed top-0 left-0 w-full z-[70] bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="what do you feel like doing?"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 text-sm border-transparent outline-none font-bold text-gray-900 focus:ring-2 focus:ring-black/5"
            />
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-11 h-11 flex items-center rounded-2xl bg-white justify-center text-gray-900 border border-gray-100 shadow-sm font-black active:scale-95"
          >
            ☰
          </button>
        </div>

        <div className="fixed top-[68px] md:top-[100px] left-0 w-full z-[40] flex flex-col items-center">
          <div className="w-full max-w-6xl px-4 relative">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar scroll-mask pb-4 pt-1">
              {/* LIVE/UPCOMING TOGGLE */}
              <div className="flex bg-white shadow-xl rounded-2xl p-1.5 border border-gray-100 shrink-0">
                {(["ongoing", "upcoming"] as FilterType[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
                      activeFilter === status
                        ? "bg-black text-white shadow-lg"
                        : "bg-transparent text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">
                      {status === "ongoing" ? "🔥" : "📅"}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                      {status === "ongoing" ? "Live" : "Upcoming"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="w-px h-10 bg-gray-200 mx-1 shrink-0" />

              {/* CONSOLIDATED CATEGORIES */}
              <div className="flex gap-2">
                {HOTSPOT_CATEGORIES.map((cat) => {
                  const isActive = activeHotspotCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveHotspotCat(cat.id);
                        setShowHotspots(true);
                      }}
                      className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 ${
                        isActive
                          ? "bg-white text-black border-black shadow-md scale-105"
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <span
                        className={isActive ? "text-black" : "text-gray-300"}
                      >
                        {cat.icon}
                      </span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <RealMap
          ref={mapRef}
          onSelect={setSelected}
          onSelectHotspot={setSelectedHotspot}
          filteredEvents={filteredEvents}
          showHotspots={showHotspots}
          hotspotCategory={activeHotspotCat}
        />

        <div className="absolute bottom-36 right-4 z-[40] md:bottom-10 md:right-10 flex flex-col gap-4">
          <button
            onClick={() => setShowGuide(true)}
            className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-400 border-2 border-gray-200 active:scale-90 transition-all"
          >
            <Info size={24} />
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all border-2 active:scale-90 ${
              showHotspots
                ? "bg-black text-white border-black"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            <Flame size={24} fill={showHotspots ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleLocateUser}
            className="w-14 h-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-black border-2 border-gray-200 active:scale-90 transition-all"
          >
            <LocateFixed size={24} />
          </button>
        </div>

        <AnimatePresence>
          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 bottom-32 z-[110] md:inset-x-auto md:right-10 md:bottom-32 md:w-80"
            >
              <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden relative">
                {/* HOTSPOT IMAGE */}
                <div className="relative h-44 w-full">
                  <Image
                    src={
                      selectedHotspot.image ||
                      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={selectedHotspot.title || "Hotspot"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-0 right-0 p-4 z-[120]">
                    {" "}
                    {/* Added high z-index */}
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-all active:scale-90"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      {selectedHotspot.category || "Hotspot"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black shrink-0">
                      <Flame size={20} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-tight">
                      {selectedHotspot.title || selectedHotspot.name}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">
                    {selectedHotspot.description ||
                      "An active hub in the city. Expect high energy and frequent events."}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 bg-gray-50 text-gray-900 font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                      <Navigation size={12} /> Directions
                    </button>
                    <button className="py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                      className="rounded-full object-cover border border-white"
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
                  className={`px-4 py-2 rounded-full text-xs font-black transition ${followedUsers.has((selected as any).organizerName) ? "bg-gray-200 text-gray-600" : "bg-black text-white"}`}
                >
                  {followedUsers.has((selected as any).organizerName)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                      👥 {selected.attendees} going
                    </span>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${(selected as any).timeStatus === "ongoing" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${(selected as any).timeStatus === "ongoing" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                      />
                      {(selected as any).timeStatus === "ongoing"
                        ? "live"
                        : "upcoming"}
                    </span>
                  </div>
                  <h2 className="font-black text-2xl text-gray-900 mt-3">
                    {selected.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => toggleLike(e, selected._id)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
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
                  className="object-cover rounded-[28px] border border-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                    <Calendar size={18} className="text-black" />
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
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                    <Clock size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Time
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {formatDateTime(selected.startDate).time}
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
                className="w-full py-5 bg-black text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                View Details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
