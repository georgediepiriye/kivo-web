/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import CreateEventMap, { MapRef } from "@/components/map/CreateEventMap";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-gray-100 animate-pulse rounded-[24px]" />
    ),
  },
);

import {
  Calendar,
  Clock,
  MapPin,
  ImageIcon,
  Users,
  Lock,
  ChevronRight,
  Trash2,
  LogIn,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { EVENT_TYPES } from "@/lib/events";

const categories = Object.values(EVENT_CATEGORIES).map((cat) => cat.label);

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Updated Date/Time states
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<"activity" | "showcase">("activity");
  const [fee, setFee] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");

  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates;
      const address =
        feature.properties.full_address || feature.properties.name;

      setLocation(address);
      setLocationCoords({ lat, lng });
      toast.success("Location pinned!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (
      !title ||
      !description ||
      !category ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !location
    ) {
      return toast.error("Please fill in all basic fields.");
    }

    if (!locationCoords) {
      return toast.error("Please pin the location on the map.");
    }

    setSubmitting(true);

    try {
      const categoryKey = Object.keys(EVENT_CATEGORIES).find(
        (key) =>
          EVENT_CATEGORIES[key as keyof typeof EVENT_CATEGORIES].label ===
          category,
      );

      const payload = {
        title,
        description,
        category: categoryKey,
        type,
        startDate: `${startDate}T${startTime}`,
        endDate: `${endDate}T${endTime}`,
        lng: locationCoords.lng,
        lat: locationCoords.lat,
        address: location,
        neighborhood: "Port Harcourt",
        isPublic,
        allowAnonymous,
        price: fee,
        isFree: fee === 0,
        capacity: maxParticipants || null,
        organizerType: "individual", // Match schema default
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create event");

      toast.success("Successfully broadcasted to the city!");
      router.push("/map");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900">
      <Toaster position="bottom-center" />
      <Navbar />

      <header className="pt-28 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-xs font-bold uppercase tracking-widest mb-4">
          <span className="animate-pulse">✨</span> Create a vibe
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-6">
          Host an{" "}
          <span className="text-[#715800]">
            {type === "showcase" ? "Event" : "Activity"}
          </span>
        </h1>

        <div className="inline-flex p-1.5 bg-gray-100 rounded-3xl border border-gray-200 shadow-inner">
          {Object.keys(EVENT_TYPES).map((t) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
                type === t
                  ? "bg-white text-[#715800] shadow-md ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "showcase"
                ? "Event"
                : EVENT_TYPES[t as keyof typeof EVENT_TYPES].label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800]">
                1
              </div>
              The Basics
            </h3>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Port Harcourt Tech Mix"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Tell everyone what the move is..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none h-40 resize-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                        category === cat
                          ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                          : "border-gray-100 text-gray-500 bg-white hover:border-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800]">
                2
              </div>
              Logistics
            </h3>
            <div className="space-y-8">
              {/* Start Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="relative cursor-pointer"
                  onClick={(e) =>
                    (
                      e.currentTarget.querySelector("input") as any
                    )?.showPicker()
                  }
                >
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                    Starts
                  </label>
                  <Calendar
                    className="absolute right-5 top-[44px] text-gray-300 pointer-events-none"
                    size={20}
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium cursor-pointer"
                  />
                </div>
                <div
                  className="relative cursor-pointer"
                  onClick={(e) =>
                    (
                      e.currentTarget.querySelector("input") as any
                    )?.showPicker()
                  }
                >
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                    At
                  </label>
                  <Clock
                    className="absolute right-5 top-[44px] text-gray-300 pointer-events-none"
                    size={20}
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="relative cursor-pointer"
                  onClick={(e) =>
                    (
                      e.currentTarget.querySelector("input") as any
                    )?.showPicker()
                  }
                >
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                    Ends
                  </label>
                  <Calendar
                    className="absolute right-5 top-[44px] text-gray-300 pointer-events-none"
                    size={20}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium cursor-pointer"
                  />
                </div>
                <div
                  className="relative cursor-pointer"
                  onClick={(e) =>
                    (
                      e.currentTarget.querySelector("input") as any
                    )?.showPicker()
                  }
                >
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                    At
                  </label>
                  <Clock
                    className="absolute right-5 top-[44px] text-gray-300 pointer-events-none"
                    size={20}
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium cursor-pointer"
                  />
                </div>
              </div>

              <div className="relative kivo-search-container">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Location
                </label>
                <MapPin
                  className="absolute left-5 top-[44px] text-gray-300 z-10"
                  size={20}
                />
                <SearchBox
                  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string}
                  value={location}
                  onChange={(val) => setLocation(val)}
                  onRetrieve={handleRetrieve}
                  placeholder="Enter a venue name or street"
                  options={{ proximity: [7.0354, 4.8156], country: "NG" }}
                  theme={{
                    variables: {
                      borderRadius: "24px",
                      unit: "16px",
                      border: "2px solid transparent",
                      boxShadow: "none",
                    },
                  }}
                />
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="mt-3 w-full py-3 bg-[#715800]/5 text-[#715800] font-black text-xs uppercase tracking-widest rounded-xl border border-[#715800]/20 hover:bg-[#715800]/10 transition"
                >
                  {locationCoords ? "Location Pinned ✓" : "Pin on Map"}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800]">
                3
              </div>
              Visuals
            </h3>
            <div className="relative border-4 border-dashed border-gray-100 rounded-[32px] p-4 text-center group transition-all hover:border-[#715800]/20">
              {preview ? (
                <div className="relative h-64 w-full rounded-2xl overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    Upload a banner image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG or WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-6">
            <section className="bg-gray-900 text-white rounded-[40px] p-8 shadow-2xl">
              <h4 className="font-black mb-6 text-sm uppercase tracking-widest text-[#715800]">
                Settings
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                    Capacity
                  </label>
                  <div className="flex items-center bg-white/10 rounded-2xl p-2">
                    <Users className="ml-2 text-white/50" size={18} />
                    <input
                      type="number"
                      placeholder="Unlimited"
                      className="bg-transparent w-full px-4 py-2 outline-none font-bold text-white placeholder:text-white/20"
                      value={maxParticipants}
                      onChange={(e) =>
                        setMaxParticipants(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                    Fee (₦)
                  </label>
                  <div className="flex items-center bg-white/10 rounded-2xl p-2 border border-white/5">
                    <span className="ml-3 font-bold text-[#715800]">₦</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="bg-transparent w-full px-4 py-2 outline-none font-bold text-white"
                      value={fee}
                      onChange={(e) => setFee(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter">
                        Public View
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Visible on the global map
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? "bg-[#715800]" : "bg-white/20"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? "right-1" : "left-1"}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter">
                        Anonymous Join
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Allow users without accounts
                      </p>
                    </div>
                    <button
                      onClick={() => setAllowAnonymous(!allowAnonymous)}
                      className={`w-12 h-6 rounded-full transition-all relative ${allowAnonymous ? "bg-[#715800]" : "bg-white/20"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowAnonymous ? "right-1" : "left-1"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-10 py-5 bg-[#715800] text-white font-black rounded-[28px] shadow-xl shadow-[#715800]/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Launching...
                  </>
                ) : isLoggedIn ? (
                  "Broadcast Event"
                ) : (
                  "Sign in to Broadcast"
                )}
                {!submitting && (
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-10 overflow-hidden shadow-2xl text-center"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-20 h-20 bg-[#715800]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-[#715800]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">
                Wait a sec!
              </h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                You need to be part of the community to broadcast moves in Port
                Harcourt.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={18} /> Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="w-full py-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showMapPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMapPicker(false)}
          />
          <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white">
            <div className="absolute top-6 left-6 z-10 bg-white p-4 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-lg font-black tracking-tighter">
                Pin your Move
              </h2>
              <p className="text-xs text-gray-500">
                Tap anywhere to set the exact spot.
              </p>
            </div>
            <button
              onClick={() => setShowMapPicker(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shadow-lg"
            >
              ✕
            </button>
            <CreateEventMap
              ref={mapRef}
              selectedCoords={locationCoords}
              onSelect={setLocationCoords}
            />
          </div>
        </div>
      )}

      <MobileNav />
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
