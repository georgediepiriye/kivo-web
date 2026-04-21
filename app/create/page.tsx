/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import CreateEventMap, { MapRef } from "@/components/map/CreateEventMap";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  MapPin,
  ImageIcon,
  Users,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Loader2,
  Ticket,
  Video,
  Globe,
  Settings2,
  Sparkles,
  Zap,
  CalendarDays,
  Link as LinkIcon,
  Eye,
  Navigation,
  Hash,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_CATEGORIES } from "@/lib/categories";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-gray-100 animate-pulse rounded-[24px]" />
    ),
  },
);

const categories = Object.values(EVENT_CATEGORIES).map((cat) => cat.label);
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const totalSteps = 4;

  // --- FORM STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"activity" | "showcase" | null>(null);
  const [eventFormat, setEventFormat] = useState<
    "physical" | "online" | "hybrid"
  >("physical");

  // Date/Time
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // --- RECURRENCE STATE ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<
    "daily" | "weekly" | "monthly" | "none"
  >("none");
  const [recurrenceInterval, setRecurrenceInterval] = useState<number | string>(
    1,
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Links
  const [externalTicketLink, setExternalTicketLink] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Location
  const [location, setLocation] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Media & Tickets
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ticketingType, setTicketingType] = useState<
    "none" | "internal" | "external"
  >("none");
  const [ticketTiers, setTicketTiers] = useState<any[]>([]);

  // Advanced Settings
  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [ageRestriction, setAgeRestriction] = useState("All Ages");
  const [refundPolicy, setRefundPolicy] = useState<"none" | "flexible" | "24h">(
    "none",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // --- HANDLERS ---
  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates;

      // Extract neighborhood safely from Mapbox properties
      const neighborhoodName =
        feature.properties.context?.neighborhood?.name ||
        feature.properties.neighborhood ||
        "";

      setLocation(feature.properties.full_address || feature.properties.name);
      setNeighborhood(neighborhoodName);
      setLocationCoords({ lat, lng });
      toast.success("Location pinned!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleIntervalChange = (val: string) => {
    if (val === "") {
      setRecurrenceInterval("");
    } else {
      const num = parseInt(val);
      setRecurrenceInterval(isNaN(num) ? "" : num);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const useCurrentLocation = () => {
    if (isLocating) return;
    if (!navigator.geolocation) return toast.error("GPS not supported.");
    setIsLocating(true);
    toast.loading("Locating...", { id: "gps-loading" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=neighborhood,address&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
          );
          const data = await res.json();

          const neighborhoodFeature = data.features.find((f: any) =>
            f.place_type.includes("neighborhood"),
          );

          setLocation(data.features[0]?.place_name || "Pinned Location");
          setNeighborhood(neighborhoodFeature?.text || "");
          toast.success("Location Pinned!", { id: "gps-loading" });
        } catch (err) {
          setLocation("Custom GPS Pin");
          toast.success("Pinned via GPS", { id: "gps-loading" });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error("Location access denied.", { id: "gps-loading" });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addTier = () =>
    setTicketTiers([
      ...ticketTiers,
      { name: "General Admission", price: 0, capacity: 50, description: "" },
    ]);
  const removeTier = (index: number) =>
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  const updateTier = (index: number, field: string, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const nextStep = () => {
    if (step === 0 && !type) return toast.error("Please select a move type.");
    if (step === 1 && (!title || !category))
      return toast.error("Title and Category are required.");
    if (step === 2 && !startDate)
      return toast.error("Please select a start date.");
    if (step === 2 && eventFormat !== "online" && !locationCoords)
      return toast.error("Please pin the location.");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return router.push("/login");
    setSubmitting(true);
    try {
      const categoryKey = Object.keys(EVENT_CATEGORIES).find(
        (k) => (EVENT_CATEGORIES as any)[k].label === category,
      );

      // CRITICAL: Explicitly sanitize numbers to prevent API validation errors
      const sanitizedTiers = ticketTiers.map((tier) => ({
        ...tier,
        price: Number(tier.price) || 0,
        capacity: Number(tier.capacity) || 0,
      }));

      const payload = {
        title,
        description,
        category: categoryKey,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        type,
        eventFormat,
        startDate: new Date(
          `${startDate}T${startTime || "00:00"}`,
        ).toISOString(),
        endDate: new Date(
          `${endDate || startDate}T${endTime || "23:59"}`,
        ).toISOString(),
        isRecurring,
        recurrence: isRecurring
          ? {
              frequency: recurrenceFrequency,
              interval: parseInt(recurrenceInterval.toString()) || 1,
              daysOfWeek: selectedDays,
              endDate: recurrenceEndDate
                ? new Date(recurrenceEndDate).toISOString()
                : null,
            }
          : null,
        location:
          eventFormat !== "online"
            ? {
                type: "Point",
                coordinates: [locationCoords?.lng, locationCoords?.lat],
                address: location,
                neighborhood: neighborhood, // Added neighborhood to payload
              }
            : null,
        ticketingType,
        ticketTiers: sanitizedTiers,
        externalTicketLink,
        joinLink,
        meetingLink,
        isPublic,
        allowAnonymous,
        ageRestriction,
        refundPolicy,
        status: "casual",
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Broadcast failed.");

      toast.success("Broadcasted!");
      router.push("/discover");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900 pb-32 md:pb-12">
      <Toaster position="bottom-center" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-24 md:pt-32 font-medium">
        {step > 0 && (
          <div className="mb-8 md:mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase text-[#715800]">
                Step {step} of {totalSteps}
              </p>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                {step === 1
                  ? "The Basics"
                  : step === 2
                    ? "Logistics"
                    : step === 3
                      ? "Ticketing"
                      : "Final Touches"}
              </h1>
            </div>
            <div className="h-1.5 w-24 md:w-32 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                className="h-full bg-[#715800]"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto py-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-[10px] font-black uppercase mb-6">
                <Sparkles size={12} /> Start Something
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
                What's the <span className="text-[#715800]">Move?</span>
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12">
                <button
                  onClick={() => {
                    setType("activity");
                    setStep(1);
                  }}
                  className="p-8 bg-white rounded-[40px] border-2 border-gray-100 hover:border-[#715800] text-left transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#715800]/5 flex items-center justify-center text-[#715800] mb-6 group-hover:scale-110">
                    <Zap size={28} />
                  </div>
                  <h3 className="text-xl font-black uppercase mb-2">
                    Activity
                  </h3>
                  <p className="text-sm text-gray-400">
                    Casual meetups or quick sessions.
                  </p>
                </button>
                <button
                  onClick={() => {
                    setType("showcase");
                    setStep(1);
                  }}
                  className="p-8 bg-white rounded-[40px] border-2 border-gray-100 hover:border-[#715800] text-left transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#715800]/5 flex items-center justify-center text-[#715800] mb-6 group-hover:scale-110">
                    <CalendarDays size={28} />
                  </div>
                  <h3 className="text-xl font-black uppercase mb-2">Event</h3>
                  <p className="text-sm text-gray-400">
                    Concerts, summits, or productions.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Move Name
                  </label>
                  <input
                    type="text"
                    placeholder="Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xl md:text-2xl p-5 md:p-6 bg-gray-50 rounded-[24px] outline-none font-black border-2 border-transparent focus:border-[#715800]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Description
                  </label>
                  <textarea
                    placeholder="The vibe..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-5 md:p-6 bg-gray-50 rounded-[24px] h-32 md:h-40 outline-none font-bold text-lg resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                    <Hash size={10} /> Search Tags
                  </label>
                  <input
                    type="text"
                    placeholder="music, tech, party"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-[#715800] text-sm font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-bold border-2 transition-all ${category === cat ? "border-[#715800] bg-[#715800]/5 text-[#715800]" : "border-gray-50 text-gray-400"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-8"
            >
              <div className="flex p-1 bg-gray-50 rounded-2xl w-fit">
                {["physical", "online", "hybrid"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEventFormat(f as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase ${eventFormat === f ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Start
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    End
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase flex items-center gap-2">
                      <Repeat size={16} className="text-[#715800]" /> Recurring
                      Move?
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      Does this happen more than once?
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`w-14 h-8 rounded-full transition-all relative ${isRecurring ? "bg-[#715800]" : "bg-gray-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isRecurring ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                {isRecurring && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-6 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">
                          Frequency
                        </label>
                        <select
                          value={recurrenceFrequency}
                          onChange={(e) =>
                            setRecurrenceFrequency(e.target.value as any)
                          }
                          className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                        >
                          <option value="none">Select...</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">
                          Every (Interval)
                        </label>
                        <input
                          type="number"
                          placeholder="1"
                          value={recurrenceInterval}
                          onChange={(e) => handleIntervalChange(e.target.value)}
                          className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">
                          Ending On
                        </label>
                        <input
                          type="date"
                          value={recurrenceEndDate}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                        />
                      </div>
                    </div>

                    {recurrenceFrequency === "weekly" && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400">
                          Repeat On
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day}
                              onClick={() => toggleDay(day)}
                              className={`w-12 h-12 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                                selectedDays.includes(day)
                                  ? "border-[#715800] bg-[#715800] text-white"
                                  : "border-gray-100 bg-gray-50 text-gray-400"
                              }`}
                            >
                              {day[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {eventFormat !== "online" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-gray-400">
                      Venue
                    </label>
                    <button
                      onClick={useCurrentLocation}
                      className="text-[10px] font-black text-[#715800] flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <Navigation
                        size={12}
                        className={isLocating ? "animate-pulse" : ""}
                      />{" "}
                      {isLocating ? "Locating..." : "Use current location"}
                    </button>
                  </div>
                  <SearchBox
                    accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                    value={location}
                    onRetrieve={handleRetrieve}
                    placeholder="Search venue..."
                    theme={{ variables: { borderRadius: "24px" } }}
                  />
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="w-full py-5 bg-gray-900 text-white font-black text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2"
                  >
                    <MapPin size={16} />{" "}
                    {locationCoords ? "Location Pinned ✓" : "Drop Map Pin"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    id: "none",
                    label: "No Tickets",
                    icon: Users,
                    sub: "Casual Join",
                  },
                  {
                    id: "internal",
                    label: "Kivo Pay",
                    icon: Ticket,
                    sub: "Safe Escrow",
                  },
                  {
                    id: "external",
                    label: "External",
                    icon: LinkIcon,
                    sub: "Third Party",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTicketingType(opt.id as any)}
                    className={`p-6 rounded-[32px] border-2 text-left transition-all ${ticketingType === opt.id ? "border-[#715800] bg-[#715800]/5" : "border-gray-50 bg-gray-50"}`}
                  >
                    <opt.icon
                      size={20}
                      className={
                        ticketingType === opt.id
                          ? "text-[#715800]"
                          : "text-gray-400"
                      }
                    />
                    <p className="font-black text-[10px] uppercase mt-4">
                      {opt.label}
                    </p>
                    <p className="text-[9px] text-gray-500">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {ticketingType === "internal" && (
                <div className="space-y-4">
                  {/* RESTORED LABELS - Desktop Header */}
                  {ticketTiers.length > 0 && (
                    <div className="hidden md:grid grid-cols-3 gap-4 px-6 mb-2">
                      <label className="text-[9px] font-black uppercase text-gray-400">
                        Tier Name
                      </label>
                      <label className="text-[9px] font-black uppercase text-gray-400">
                        Price (₦)
                      </label>
                      <label className="text-[9px] font-black uppercase text-gray-400">
                        Capacity
                      </label>
                    </div>
                  )}

                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-gray-50 rounded-[32px] grid md:grid-cols-3 gap-4 relative border border-transparent focus-within:border-gray-200 transition-all"
                    >
                      {/* Mobile Labels + Inputs */}
                      <div className="space-y-1">
                        <label className="md:hidden text-[8px] font-black uppercase text-gray-400 ml-2">
                          Tier Name
                        </label>
                        <input
                          placeholder="Early Bird"
                          value={tier.name}
                          onChange={(e) =>
                            updateTier(idx, "name", e.target.value)
                          }
                          className="w-full p-3 rounded-xl bg-white font-bold text-sm outline-none border-2 border-transparent focus:border-[#715800]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="md:hidden text-[8px] font-black uppercase text-gray-400 ml-2">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={tier.price}
                          onChange={(e) =>
                            updateTier(idx, "price", e.target.value)
                          }
                          className="w-full p-3 rounded-xl bg-white font-bold text-sm outline-none border-2 border-transparent focus:border-[#715800]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="md:hidden text-[8px] font-black uppercase text-gray-400 ml-2">
                          Capacity
                        </label>
                        <input
                          type="number"
                          placeholder="50"
                          value={tier.capacity}
                          onChange={(e) =>
                            updateTier(idx, "capacity", e.target.value)
                          }
                          className="w-full p-3 rounded-xl bg-white font-bold text-sm outline-none border-2 border-transparent focus:border-[#715800]"
                        />
                      </div>
                      <button
                        onClick={() => removeTier(idx)}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTier}
                    className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[32px] text-[10px] font-black uppercase text-gray-400 hover:text-[#715800] hover:border-[#715800]"
                  >
                    + Create Ticket Tier
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Relevant Links
                </label>
                {ticketingType === "external" && (
                  <input
                    type="url"
                    placeholder="Link to external tickets"
                    value={externalTicketLink}
                    onChange={(e) => setExternalTicketLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  />
                )}
                {ticketingType === "none" && (
                  <input
                    type="url"
                    placeholder="WhatsApp / Telegram Join Link"
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  />
                )}
                {eventFormat !== "physical" && (
                  <input
                    type="url"
                    placeholder="Meeting Link (Zoom/Meet)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                  />
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black uppercase mb-6">
                    Banner Image
                  </h3>
                  <label className="block h-64 md:h-80 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-200 cursor-pointer overflow-hidden relative group">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="p"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-[#715800]">
                        <ImageIcon size={48} />
                        <span className="text-[10px] font-black uppercase mt-4">
                          Upload High Res Cover
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gray-900 text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-6 lg:sticky lg:top-32">
                  <div className="flex items-center gap-2 text-[#715800] font-black text-[10px] uppercase">
                    <Settings2 size={16} /> Preferences
                  </div>
                  <div className="space-y-5">
                    <div
                      className="flex justify-between items-center"
                      onClick={() => setIsPublic(!isPublic)}
                    >
                      <div className="text-[10px] font-black uppercase">
                        Public Visibility
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? "bg-[#715800]" : "bg-white/10"}`}
                      >
                        <motion.div
                          animate={{ x: isPublic ? 20 : 4 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full"
                        />
                      </div>
                    </div>
                    <div
                      className="flex justify-between items-center"
                      onClick={() => setAllowAnonymous(!allowAnonymous)}
                    >
                      <div className="text-[10px] font-black uppercase">
                        Anonymous Join
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors ${allowAnonymous ? "bg-[#715800]" : "bg-white/10"}`}
                      >
                        <motion.div
                          animate={{ x: allowAnonymous ? 20 : 4 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-500">
                        Refund Policy
                      </label>
                      <select
                        value={refundPolicy}
                        onChange={(e) => setRefundPolicy(e.target.value as any)}
                        className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-bold text-white outline-none"
                      >
                        <option value="none">No Refunds</option>
                        <option value="flexible">Flexible</option>
                        <option value="24h">24h Notice</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full py-5 bg-[#715800] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    Preview Move <Eye size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFCF9]/90 backdrop-blur-md border-t border-gray-100 z-[100] md:relative md:bg-transparent md:border-none md:p-0 md:mt-12">
            <div className="max-w-4xl mx-auto flex justify-between gap-4">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase text-gray-400 bg-white border border-gray-100"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {step < 4 && (
                <button
                  onClick={nextStep}
                  className="flex-1 md:flex-none px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-48 md:h-56 relative bg-gray-100">
                {preview && (
                  <Image src={preview} alt="p" fill className="object-cover" />
                )}
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-[#715800] text-[10px] font-black uppercase tracking-widest">
                      {category}
                    </div>
                    {isRecurring && (
                      <div className="flex items-center gap-1 text-[#715800] text-[9px] font-black uppercase bg-[#715800]/5 px-2 py-1 rounded-lg">
                        <Repeat size={10} /> Recurring
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    {title || "Untitled Move"}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-[#715800]" />{" "}
                    {startDate || "TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-[#715800]" />{" "}
                    {location || "TBD"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="py-4 bg-gray-100 rounded-3xl font-black text-[10px] uppercase"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="py-4 bg-[#715800] text-white rounded-3xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        Broadcast Now <Sparkles size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showMapPicker && (
          <div className="fixed inset-0 z-[600] bg-white flex flex-col">
            <div className="p-4 md:p-6 border-b flex justify-between items-center bg-white">
              <h2 className="font-black text-lg uppercase tracking-tighter">
                Adjust Map Pin
              </h2>
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-6 md:px-10 py-3 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase"
              >
                Lock Location
              </button>
            </div>
            <div className="flex-1">
              <CreateEventMap
                ref={mapRef}
                selectedCoords={locationCoords}
                onSelect={setLocationCoords}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
