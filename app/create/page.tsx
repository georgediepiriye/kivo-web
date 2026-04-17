/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import CreateEventMap, { MapRef } from "@/components/map/CreateEventMap";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  MapPin,
  ImageIcon,
  Users,
  Lock,
  ChevronRight,
  ChevronLeft,
  Trash2,
  X,
  Loader2,
  Ticket,
  Video,
  Globe,
  CheckCircle2,
  Settings2,
  Sparkles,
  Zap,
  CalendarDays,
  Link as LinkIcon,
  Eye,
  Info,
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

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const totalSteps = 4;

  // --- FORM STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"activity" | "showcase" | null>(null);
  const [eventFormat, setEventFormat] = useState<
    "physical" | "online" | "hybrid"
  >("physical");

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [externalTicketLink, setExternalTicketLink] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ticketingType, setTicketingType] = useState<
    "none" | "internal" | "external"
  >("none");
  const [ticketTiers, setTicketTiers] = useState<any[]>([]);

  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [ageRestriction, setAgeRestriction] = useState("All Ages");
  const [refundPolicy, setRefundPolicy] = useState<"none" | "flexible" | "24h">(
    "none",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // --- HANDLERS ---
  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates;
      setLocation(feature.properties.full_address || feature.properties.name);
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
      return toast.error("Please pin the location on the map.");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return setShowAuthModal(true);
    setSubmitting(true);
    try {
      const categoryKey = Object.keys(EVENT_CATEGORIES).find(
        (key) => (EVENT_CATEGORIES as any)[key].label === category,
      );
      const payload = {
        title,
        description,
        category: categoryKey,
        type,
        eventFormat,
        isOnline: eventFormat === "online",
        startDate: new Date(
          `${startDate}T${startTime || "00:00"}`,
        ).toISOString(),
        endDate: new Date(
          `${endDate || startDate}T${endTime || "23:59"}`,
        ).toISOString(),
        location:
          eventFormat !== "online"
            ? {
                type: "Point",
                coordinates: [locationCoords?.lng, locationCoords?.lat],
                address: location,
                neighborhood: "Port Harcourt",
              }
            : null,
        ticketingType,
        ticketTiers,
        externalTicketLink:
          externalTicketLink.trim() === "" ? null : externalTicketLink,
        joinLink: joinLink.trim() === "" ? null : joinLink,
        meetingLink: meetingLink.trim() === "" ? null : meetingLink,
        isPublic,
        allowAnonymous,
        ageRestriction,
        refundPolicy,
        organizerType: "individual",
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
      if (!res.ok) throw new Error("Failed to broadcast move.");
      toast.success("Your move is now live!");
      router.push("/map");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900 font-sans pb-32 md:pb-20">
      <Toaster position="bottom-center" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-24 md:pt-32">
        {/* Progress Header */}
        {step > 0 && (
          <div className="mb-8 md:mb-12 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#715800] mb-1">
                Step {step} of {totalSteps}
              </p>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                {step === 1 && "The Basics"} {step === 2 && "Logistics"}{" "}
                {step === 3 && "Ticketing"} {step === 4 && "Final Touches"}
              </h1>
            </div>
            <div className="h-1.5 w-24 md:w-32 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                className="h-full bg-[#715800]"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: SELECTION */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-[10px] font-black uppercase mb-6">
                <Sparkles size={12} /> Start Something
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
                What's the <span className="text-[#715800]">Move?</span>
              </h1>
              <p className="text-gray-500 font-medium mb-12">
                Choose how you want to broadcast your plan.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button
                  onClick={() => {
                    setType("activity");
                    setStep(1);
                  }}
                  className="group p-6 md:p-10 bg-white rounded-[32px] md:rounded-[40px] border-2 border-gray-100 hover:border-[#715800] text-left transition-all"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#715800]/5 flex items-center justify-center text-[#715800] mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase mb-2">
                    An Activity
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    Ideal for wellness sessions, social hangouts, or community
                    meetups—focused on seamless access.
                  </p>
                </button>
                <button
                  onClick={() => {
                    setType("showcase");
                    setStep(1);
                  }}
                  className="group p-6 md:p-10 bg-white rounded-[32px] md:rounded-[40px] border-2 border-gray-100 hover:border-[#715800] text-left transition-all"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#715800]/5 flex items-center justify-center text-[#715800] mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                    <CalendarDays size={32} />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase mb-2">
                    An Event
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                    Organized productions or summits. Includes professional
                    ticketing and RSVP flows.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-6 md:space-y-8"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="E.g. Port Harcourt Tech Meetup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg md:text-2xl p-4 md:p-6 bg-gray-50 rounded-[20px] md:rounded-[24px] outline-none font-black border-2 border-transparent focus:border-[#715800] focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Description
                </label>
                <textarea
                  placeholder="Describe the energy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 md:p-6 bg-gray-50 rounded-[20px] md:rounded-[24px] h-32 md:h-40 outline-none font-medium text-base md:text-lg resize-none"
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
                      className={`px-4 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-bold border-2 transition-all ${category === cat ? "border-[#715800] bg-[#715800]/5 text-[#715800]" : "border-gray-50 text-gray-400 bg-white hover:border-gray-200"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOGISTICS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-6 md:space-y-8"
            >
              <div className="flex p-1 bg-gray-50 rounded-2xl w-fit">
                {["physical", "online", "hybrid"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEventFormat(f as any)}
                    className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-[10px] font-black uppercase transition-all ${eventFormat === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                  >
                    {f === "online" ? <Video size={14} /> : <Globe size={14} />}{" "}
                    {f}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Start Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl font-bold outline-none text-sm md:text-base"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-1/3 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl font-bold outline-none text-sm md:text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    End Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl font-bold outline-none text-sm md:text-base"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-1/3 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl font-bold outline-none text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
              {eventFormat !== "online" && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Venue
                  </label>
                  <SearchBox
                    accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                    value={location}
                    onRetrieve={handleRetrieve}
                    placeholder="Search venue..."
                    theme={{
                      variables: { borderRadius: "24px", border: "none" },
                    }}
                  />
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="w-full py-4 md:py-5 bg-gray-900 text-white font-black text-[10px] uppercase rounded-xl md:rounded-2xl flex items-center justify-center gap-2"
                  >
                    <MapPin size={16} />{" "}
                    {locationCoords ? "Location Pinned ✓" : "Drop Map Pin"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: TICKETING */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-6 md:space-y-8"
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
                    className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 text-left transition-all ${ticketingType === opt.id ? "border-[#715800] bg-[#715800]/5" : "border-gray-50 bg-gray-50"}`}
                  >
                    <opt.icon
                      size={20}
                      className={
                        ticketingType === opt.id
                          ? "text-[#715800]"
                          : "text-gray-400"
                      }
                    />
                    <p className="font-black text-[10px] uppercase mt-2 md:mt-4">
                      {opt.label}
                    </p>
                    <p className="text-[9px] text-gray-500">{opt.sub}</p>
                  </button>
                ))}
              </div>
              {ticketingType === "internal" && (
                <div className="space-y-4">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-4 md:p-6 bg-gray-50 rounded-[24px] md:rounded-[32px] grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 relative"
                    >
                      <input
                        placeholder="Tier Name"
                        value={tier.name}
                        onChange={(e) =>
                          updateTier(idx, "name", e.target.value)
                        }
                        className="p-3 rounded-xl bg-white font-bold text-xs md:text-sm outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Price (₦)"
                        value={tier.price}
                        onChange={(e) =>
                          updateTier(idx, "price", Number(e.target.value))
                        }
                        className="p-3 rounded-xl bg-white font-bold text-xs md:text-sm outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Capacity"
                        value={tier.capacity}
                        onChange={(e) =>
                          updateTier(idx, "capacity", Number(e.target.value))
                        }
                        className="p-3 rounded-xl bg-white font-bold text-xs md:text-sm outline-none"
                      />
                      <button
                        onClick={() => removeTier(idx)}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTier}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl text-[10px] font-black uppercase text-gray-400 hover:text-[#715800] transition-colors"
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
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm"
                  />
                )}
                {ticketingType === "none" && (
                  <input
                    type="url"
                    placeholder="WhatsApp / Telegram Link"
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm"
                  />
                )}
                {eventFormat !== "physical" && (
                  <input
                    type="url"
                    placeholder="Meeting Link (Zoom/Meet)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none text-sm"
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: VISUALS & ADVANCED */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
            >
              <div className="md:col-span-8 space-y-6">
                <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100">
                  <h3 className="text-lg md:text-xl font-black uppercase mb-6">
                    Banner Image
                  </h3>
                  <label className="block h-48 md:h-72 bg-gray-50 rounded-[24px] md:rounded-[32px] border-4 border-dashed border-gray-200 cursor-pointer overflow-hidden relative group">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-[#715800] transition-colors">
                        <ImageIcon size={48} />
                        <span className="text-[10px] font-black uppercase mt-4">
                          Upload Cover
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
              <div className="md:col-span-4 space-y-6">
                <div className="bg-gray-900 text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-6 md:space-y-8 md:sticky md:top-32">
                  <div className="flex items-center gap-2 text-[#715800] font-black text-[10px] uppercase">
                    <Settings2 size={16} /> Settings
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase">
                        Public
                      </div>
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`w-12 h-6 rounded-full relative ${isPublic ? "bg-[#715800]" : "bg-white/10"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase">
                        Anonymous
                      </div>
                      <button
                        onClick={() => setAllowAnonymous(!allowAnonymous)}
                        className={`w-12 h-6 rounded-full relative ${allowAnonymous ? "bg-[#715800]" : "bg-white/10"}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowAnonymous ? "right-1" : "left-1"}`}
                        />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-500">
                        Age
                      </label>
                      <select
                        value={ageRestriction}
                        onChange={(e) => setAgeRestriction(e.target.value)}
                        className="w-full bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-bold outline-none"
                      >
                        <option className="bg-gray-900" value="All Ages">
                          All Ages
                        </option>
                        <option className="bg-gray-900" value="18+">
                          18+
                        </option>
                        <option className="bg-gray-900" value="21+">
                          21+
                        </option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full py-4 md:py-5 bg-[#715800] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase flex items-center justify-center gap-2"
                  >
                    Preview Move <Eye size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Bottom Nav (Mobile Fixed) */}
        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFCF9]/80 backdrop-blur-md border-t border-gray-100 z-[100] md:relative md:bg-transparent md:backdrop-blur-none md:border-none md:p-0 md:mt-12">
            <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase text-gray-400 hover:text-black bg-white md:bg-transparent border border-gray-100 md:border-none shadow-sm md:shadow-none"
              >
                <ChevronLeft size={16} /> Back
              </button>
              {step < 4 && (
                <button
                  onClick={nextStep}
                  className="flex-1 md:flex-none px-6 py-3 md:px-10 md:py-4 bg-gray-900 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL & OVERLAYS - REMAINS SAME FOR FUNCTIONALITY BUT WITH MOBILE PADDING FIXES */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-40 md:h-56 relative bg-gray-100">
                {preview ? (
                  <Image src={preview} alt="p" fill className="object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase">
                  {type}
                </div>
              </div>
              <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <div className="text-[#715800] text-[10px] font-black uppercase tracking-widest">
                    {category}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight">
                    {title || "Move Untitled"}
                  </h2>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 text-gray-500 text-[10px] md:text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-[#715800]" />{" "}
                    {startDate || "TBD"} at {startTime || "TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-[#715800]" />{" "}
                    {location || "Virtual Venue"}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500 line-clamp-3 leading-relaxed">
                  {description}
                </p>
                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 border-t">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="py-4 md:py-5 bg-gray-100 rounded-2xl md:rounded-3xl font-black text-[10px] uppercase"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="py-4 md:py-5 bg-[#715800] text-white rounded-2xl md:rounded-3xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      "Broadcast Move"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMapPicker && (
          <div className="fixed inset-0 z-[600] bg-white flex flex-col">
            <div className="p-4 md:p-6 border-b flex justify-between items-center bg-white shadow-sm">
              <h2 className="font-black text-lg md:text-xl uppercase tracking-tighter">
                Precise Pin Drop
              </h2>
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-6 py-2 md:px-10 md:py-3 bg-[#715800] text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase"
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
      <MobileNav />
    </div>
  );
}
