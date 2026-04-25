/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  X,
  Loader2,
  Search,
  LocateFixed,
  Calendar,
  Clock,
  Flame,
  Navigation,
  Music,
  Utensils,
  Coffee,
  Sparkles,
  ShoppingBag,
  Palette,
  Info,
  Ticket,
  Globe,
  MapPin,
  User as UserIcon,
  Settings,
  LogOut,
  PlusCircle,
  MessageSquare,
  Compass,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

  const [selected, setSelected] = useState<Event | any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ongoing");
  const [activeHotspotCat, setActiveHotspotCat] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // AUTH STATE LOGIC
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isMounted: false,
    user: null as any,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (response.ok) {
        const result = await response.json();
        setAuthState({
          isLoggedIn: result.authenticated,
          isMounted: true,
          user: result.user,
        });
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      setAuthState({
        isLoggedIn: false,
        isMounted: true,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [checkAuth]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState({ isLoggedIn: false, isMounted: true, user: null });
      setMenuOpen(false);
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/discover", label: "Discover", icon: <Compass size={18} /> },
    { href: "/create", label: "Add Event", icon: <PlusCircle size={18} /> },
    { href: "/chat", label: "AI Assistant", icon: <MessageSquare size={18} /> },
    { href: "/about", label: "About", icon: <Info size={18} /> },
    { href: "/contact", label: "Contact Us", icon: <Phone size={18} /> },
  ];

  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("kivo_map_guided");
    }
    return false;
  });

  const closeGuide = () => {
    localStorage.setItem("kivo_map_guided", "true");
    setShowGuide(false);
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events?limit=100`,
      );
      if (!response.ok) throw new Error("Network error");
      const result = await response.json();
      if (result.status !== "success") throw new Error("Fetch failed");

      return result.data.events.map((e: any) => ({
        ...e,
        id: e._id,
        lat: e.location?.coordinates[1],
        lng: e.location?.coordinates[0],
        isOnline: e.medium === "online" || e.isOnline === true,
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
        if (event.timeStatus === "past" || event.isCancelled) return false;
        const matchesSearch =
          !search || event.title.toLowerCase().includes(query);
        const matchesFilter = event.timeStatus === activeFilter;
        return matchesSearch && matchesFilter;
      });
  }, [events, search, activeFilter]);

  const displayPrice = useMemo(() => {
    if (!selected) return "";

    const tiers = selected.ticketTiers || [];
    const hasTiers = Array.isArray(tiers) && tiers.length > 0;

    if (hasTiers) {
      const prices = tiers
        .map((t: any) => Number(t.price))
        .filter((p: number) => !isNaN(p));
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === 0 && max > 0) return "Free +";
      if (min === 0 && max === 0) return "Free";
      if (min === max) return `₦${min.toLocaleString()}`;
      return `From ₦${min.toLocaleString()}`;
    }

    if (selected.startingPrice > 0) {
      return `₦${selected.startingPrice.toLocaleString()}`;
    }

    if (selected.isFree || selected.ticketingType === "none") return "Free";
    if (selected.externalTicketLink || selected.joinLink) return "Paid";
    return selected.isPublic === false ? "Invite Only" : "Free";
  }, [selected]);

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
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current?.flyTo({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      });
    }
  }, []);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans text-gray-900 antialiased">
      {authState.isMounted && !authState.isLoggedIn && <OnboardingFlow />}
      <AnimatePresence>
        {showGuide && <MapGuide onClose={closeGuide} />}
      </AnimatePresence>
      <style jsx global>{`
        .mapboxgl-ctrl-geolocate {
          visibility: hidden !important;
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
        }
      `}</style>

      {/* MOBILE SIDE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[300px] bg-white z-[160] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <span className="font-black italic text-xl tracking-tighter text-[#715800]">
                  KIVO
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 bg-gray-50 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-4">
                {/* PROFILE SECTION */}
                {authState.isLoggedIn && (
                  <div className="mb-10 p-4 bg-gray-50 rounded-[32px] flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl relative overflow-hidden bg-white border border-gray-100">
                      {authState.user?.image ? (
                        <Image
                          src={authState.user.image}
                          alt="User"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <UserIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">
                        {authState.user?.name || "Kivo User"}
                      </p>
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setMenuOpen(false);
                        }}
                        className="text-[10px] font-black text-[#715800] uppercase tracking-widest"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* LINKS */}
                <div className="space-y-2">
                  {navLinks.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 group-hover:text-[#715800]">
                          {item.icon}
                        </span>
                        <span className="font-black text-xs uppercase tracking-widest">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <Settings
                        size={18}
                        className="text-gray-400 group-hover:text-[#715800]"
                      />
                      <span className="font-black text-xs uppercase tracking-widest">
                        Settings
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </button>
                </div>
              </div>

              {/* AUTH ACTION */}
              <div className="p-8 border-t border-gray-50">
                {authState.isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-5 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        router.push("/auth/signup");
                        setMenuOpen(false);
                      }}
                      className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => {
                        router.push("/auth/signin");
                        setMenuOpen(false);
                      }}
                      className="w-full py-5 bg-gray-50 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              placeholder="what do you want to do?"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 text-sm border-transparent outline-none font-bold text-gray-900"
            />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-11 h-11 flex items-center rounded-2xl bg-white justify-center text-gray-900 border border-gray-100 shadow-sm font-black"
          >
            ☰
          </button>
        </div>

        <div className="fixed top-[68px] md:top-[100px] left-0 w-full z-[40] flex flex-col items-center">
          <div className="w-full max-w-6xl px-4 relative">
            <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar scroll-mask pb-4 pt-1">
              <div className="flex bg-white/90 backdrop-blur-xl shadow-xl rounded-full p-1 border border-gray-100 shrink-0">
                {(["ongoing", "upcoming"] as FilterType[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 font-black text-[10px] uppercase tracking-widest border ${
                      activeFilter === status
                        ? "border-gray-900 text-gray-900 bg-white"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {status === "ongoing" ? "🔥 Live" : "📅 Upcoming"}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-gray-200/60 mx-1 shrink-0" />

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
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                        isActive
                          ? "bg-white text-gray-900 border-gray-900 shadow-md"
                          : "bg-white/80 backdrop-blur-md text-gray-400 border-gray-100 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <span
                        className={isActive ? "text-gray-900" : "text-gray-300"}
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

        <div className="absolute bottom-36 right-4 z-[40] md:bottom-10 md:right-10 flex flex-col gap-2.5">
          <button
            onClick={() => setShowGuide(true)}
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-400 border border-gray-100 active:scale-90"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all border active:scale-90 ${showHotspots ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100"}`}
          >
            <Flame size={18} fill={showHotspots ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleLocateUser}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-black border border-gray-100 active:scale-90"
          >
            <LocateFixed size={18} />
          </button>
        </div>

        <AnimatePresence>
          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-32 z-[110] md:inset-x-auto md:right-10 md:w-80"
            >
              <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden relative">
                <div className="relative h-44 w-full">
                  <Image
                    src={
                      selectedHotspot.image ||
                      "https://picsum.photos/seed/kivo/800/600"
                    }
                    alt="Hotspot"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 z-[120]">
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-2">
                    {selectedHotspot.title || selectedHotspot.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-6 leading-relaxed">
                    {selectedHotspot.description ||
                      "An active hub in the city."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-3 bg-gray-50 text-gray-900 font-black rounded-2xl text-[10px] uppercase border border-gray-100 flex items-center justify-center gap-2">
                      <Navigation size={12} /> Directions
                    </button>
                    <button className="py-3 bg-black text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">
                      Explore
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
              transition={{ type: "spring", damping: 25 }}
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
                      src={selected.organizerImage}
                      alt="Org"
                      fill
                      className="rounded-full object-cover border border-white"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                      Posted By
                    </p>
                    <p className="font-bold text-sm text-gray-900">
                      {selected.organizerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(selected.organizerName)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition ${followedUsers.has(selected.organizerName) ? "bg-gray-200 text-gray-600" : "bg-black text-white"}`}
                >
                  {followedUsers.has(selected.organizerName)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                      👥 {selected.attendees || 0} going
                    </span>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${selected.timeStatus === "ongoing" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${selected.timeStatus === "ongoing" ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                      />{" "}
                      {selected.timeStatus}
                    </span>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${selected.isOnline ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}
                    >
                      {selected.isOnline ? (
                        <Globe size={10} />
                      ) : (
                        <MapPin size={10} />
                      )}
                      {selected.isOnline ? "Online" : "Physical"}
                    </span>
                  </div>
                  <h2 className="font-black text-2xl text-gray-900 mt-3 tracking-tight">
                    {selected.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => toggleLike(e, selected._id)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-90"
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
                  className="object-cover rounded-[28px] border border-gray-50"
                />
                {selected.isOnline && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                    <Globe size={10} className="animate-pulse" />
                    Online
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Calendar size={18} className="text-black" />
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
                  <Clock size={18} className="text-black" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Time
                    </p>
                    <p className="text-xs font-bold text-gray-900">
                      {formatDateTime(selected.startDate).time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Ticket size={18} className="text-black" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Entry
                    </p>
                    <p
                      className={`text-xs font-black ${selected.isFree ? "text-green-600" : "text-gray-900"}`}
                    >
                      {displayPrice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {selected.isOnline ? (
                    <Globe size={18} className="text-blue-600" />
                  ) : (
                    <MapPin size={18} className="text-black" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase">
                      Location
                    </p>
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {selected.isOnline
                        ? "Worldwide"
                        : selected.location?.neighborhood || "Port Harcourt"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={12} className="text-gray-400" />
                    <p className="text-[10px] text-gray-400 font-black uppercase">
                      Vibe
                    </p>
                  </div>
                  <p className="text-sm font-black text-gray-900 capitalize">
                    {selected.category}
                  </p>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={12} className="text-gray-400" />
                    <p className="text-[10px] text-gray-400 font-black uppercase">
                      Medium
                    </p>
                  </div>
                  <p className="text-sm font-black text-gray-900 capitalize">
                    {selected.isOnline ? "Remote" : "In-Person"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/discover/${selected.id}`)}
                className="w-full py-5 bg-black text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
              >
                Go to Event Page
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MobileNav />
    </div>
  );
}
