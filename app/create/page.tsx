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
  Plus,
  Ticket,
  Info,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { EVENT_TYPES } from "@/lib/events";

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

interface ITicketTier {
  name: string;
  price: number;
  capacity: number;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [externalTicketLink, setExternalTicketLink] = useState("");
  const [type, setType] = useState<"activity" | "showcase">("activity");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Location State
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Media State
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Professional Schema Settings
  const [isFree, setIsFree] = useState(true);
  const [ticketTiers, setTicketTiers] = useState<ITicketTier[]>([]);
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

  // Ticketing Logic
  const addTier = () => {
    setTicketTiers([
      ...ticketTiers,
      { name: "General Admission", price: 0, capacity: 50, description: "" },
    ]);
  };

  const removeTier = (index: number) => {
    const updated = ticketTiers.filter((_, i) => i !== index);
    setTicketTiers(updated);
    if (updated.length === 0) setIsFree(true);
  };

  const updateTier = (index: number, field: keyof ITicketTier, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates;
      setLocation(feature.properties.full_address || feature.properties.name);
      setLocationCoords({ lat, lng });
      toast.success("Location synced!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async () => {
    // 1. Auth Guard
    if (!isLoggedIn) return setShowAuthModal(true);

    // 2. Validation Guard
    if (!title || !description || !category || !startDate || !locationCoords) {
      return toast.error("Please complete the required fields.");
    }

    setSubmitting(true);
    try {
      // Find the internal key (e.g., "nightlife") from the display label (e.g., "Social")
      const categoryKey = Object.keys(EVENT_CATEGORIES).find(
        (key) =>
          EVENT_CATEGORIES[key as keyof typeof EVENT_CATEGORIES].label ===
          category,
      );

      // If there's an external link, we treat it as "not managed by Kivo" (isFree: false)
      const finalIsFree = externalTicketLink ? false : isFree;

      // Construct the GeoJSON and Ticketing payload
      const payload = {
        title,
        description,
        category: categoryKey,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        externalTicketLink: externalTicketLink || null,
        type,
        startDate: new Date(`${startDate}T${startTime}`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}`).toISOString(),

        // Nested location object to match Mongoose & Zod requirements
        location: {
          type: "Point",
          coordinates: [locationCoords.lng, locationCoords.lat], // [lng, lat] for MongoDB
          address: location,
          neighborhood: "Port Harcourt", // Hardcoded as per your current local discovery requirement
        },

        isPublic,
        allowAnonymous,
        isFree: finalIsFree,

        // Logic: Only send tiers if the event is paid AND managed locally (no external link)
        ticketTiers: finalIsFree || externalTicketLink ? [] : ticketTiers,

        // Logic: Calculate total capacity from tiers, or null if it's free/external
        totalCapacity:
          finalIsFree || externalTicketLink
            ? null
            : ticketTiers.reduce(
                (acc, curr) => acc + (Number(curr.capacity) || 0),
                0,
              ),

        ageRestriction,
        refundPolicy,
        organizerType: "individual",
        status: "casual",
      };

      console.log(payload, "BODY__");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to broadcast move.");
      }

      toast.success("Move is live on the map!");
      router.push("/map");
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900">
      <Toaster position="bottom-center" />
      <Navbar />

      <header className="pt-28 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-[10px] font-black uppercase tracking-widest mb-4">
          <span className="animate-pulse">✨</span> Host a New Move
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
          Create an{" "}
          <span className="text-[#715800] capitalize">
            {type === "showcase" ? "Event" : "Activity"}
          </span>
        </h1>

        <div className="inline-flex p-1.5 bg-gray-100 rounded-3xl border border-gray-200">
          {["activity", "showcase"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all ${
                type === t
                  ? "bg-white text-[#715800] shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "showcase" ? "Event" : "Activity"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: The Basics */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                1
              </div>
              The Basics
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium"
              />

              <div className="relative">
                <input
                  type="url"
                  placeholder="External Ticket Link (Optional)"
                  value={externalTicketLink}
                  onChange={(e) => setExternalTicketLink(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm pr-12"
                />
                <LinkIcon
                  size={16}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"
                />
              </div>

              <textarea
                placeholder="Provide a detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none h-40 resize-none transition-all font-medium"
              />

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2 block ml-1">
                  Tags (comma separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nightlife, Afrobeats, Concert"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm pr-12"
                  />
                  <Hash
                    size={16}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3 block ml-1">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                        category === cat
                          ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                          : "border-gray-50 text-gray-400 bg-white hover:border-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Professional Ticketing */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                  2
                </div>
                Ticketing
              </h3>
              {!externalTicketLink && (
                <button
                  onClick={() => {
                    const nextState = !isFree;
                    setIsFree(nextState);
                    if (!nextState && ticketTiers.length === 0) addTier();
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all active:scale-95 whitespace-nowrap ${
                    isFree
                      ? "bg-green-50 border-green-100 text-green-700 hover:bg-green-100"
                      : "bg-[#715800] border-[#715800] text-white hover:opacity-90 shadow-lg shadow-[#715800]/20"
                  }`}
                >
                  <Ticket size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isFree ? "Free Entry — Click to Change" : "Paid Event"}
                  </span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {externalTicketLink ? (
                <motion.div
                  key="external"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 border-4 border-dashed border-[#715800]/20 rounded-[32px] bg-[#715800]/5 flex flex-col items-center text-center px-6"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <LinkIcon className="text-[#715800]" size={24} />
                  </div>
                  <h4 className="font-black text-gray-900">
                    External Link Active
                  </h4>
                  <p className="text-xs text-gray-500 mt-2 max-w-[280px]">
                    Ticketing is being handled via the external link you
                    provided in "The Basics". Manual tiers are disabled to
                    prevent duplicate bookings.
                  </p>
                </motion.div>
              ) : isFree ? (
                <motion.div
                  key="free"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-12 border-4 border-dashed border-gray-50 rounded-[32px] bg-gray-50/30 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Users className="text-gray-200" size={24} />
                  </div>
                  <h4 className="font-black text-gray-900">Open to Everyone</h4>
                  <p className="text-xs text-gray-400 mt-2 max-w-[240px]">
                    This event is currently set to free entry. Tap the toggle
                    above to start selling tickets.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="paid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {ticketTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 relative group"
                    >
                      <button
                        onClick={() => removeTier(index)}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md border border-red-50 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block ml-1">
                            Tier Name
                          </label>
                          <input
                            type="text"
                            placeholder="Early Bird"
                            value={tier.name}
                            onChange={(e) =>
                              updateTier(index, "name", e.target.value)
                            }
                            className="w-full bg-white px-5 py-3 rounded-2xl border border-transparent focus:border-[#715800] outline-none text-sm font-bold shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block ml-1">
                            Price (₦)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={tier.price}
                            onChange={(e) =>
                              updateTier(index, "price", Number(e.target.value))
                            }
                            className="w-full bg-white px-5 py-3 rounded-2xl border border-transparent focus:border-[#715800] outline-none text-sm font-bold shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block ml-1">
                            Capacity
                          </label>
                          <input
                            type="number"
                            placeholder="50"
                            value={tier.capacity}
                            onChange={(e) =>
                              updateTier(
                                index,
                                "capacity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full bg-white px-5 py-3 rounded-2xl border border-transparent focus:border-[#715800] outline-none text-sm font-bold shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addTier}
                    className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#715800] hover:text-[#715800] transition-all bg-white"
                  >
                    <Plus size={18} /> Add Ticket Type
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Section 3: Logistics */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                3
              </div>
              Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Start Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#715800] text-sm font-bold"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-2/5 bg-gray-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#715800] text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  End Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#715800] text-sm font-bold"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-2/5 bg-gray-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-[#715800] text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="relative kivo-search-container">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-2 block">
                Venue Location
              </label>
              <SearchBox
                accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                value={location}
                onChange={(val) => setLocation(val)}
                onRetrieve={handleRetrieve}
                placeholder="Search location"
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
                className="mt-4 w-full py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition flex items-center justify-center gap-2"
              >
                <MapPin size={16} />
                {locationCoords ? "Pin Updated ✓" : "Pin Exactly on Map"}
              </button>
            </div>
          </section>

          {/* Section 4: Visuals */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                4
              </div>
              Visuals
            </h3>
            <div className="relative border-4 border-dashed border-gray-100 rounded-[32px] p-2 text-center group transition-all hover:border-[#715800]/20">
              {preview ? (
                <div className="relative h-64 w-full rounded-[24px] overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon size={32} className="text-gray-200" />
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    Upload Banner
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

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 text-white rounded-[40px] p-8 sticky top-28 shadow-2xl border-t-8 border-[#715800]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#715800] mb-8">
              Advanced Settings
            </h4>

            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Public
                  </p>
                  <p className="text-[10px] text-gray-500">Searchable on map</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full relative transition-all ${
                    isPublic ? "bg-[#715800]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      isPublic ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Anon Join
                  </p>
                  <p className="text-[10px] text-gray-500">No account needed</p>
                </div>
                <button
                  onClick={() => setAllowAnonymous(!allowAnonymous)}
                  className={`w-12 h-6 rounded-full relative transition-all ${
                    allowAnonymous ? "bg-[#715800]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      allowAnonymous ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div>
                  <label className="text-[9px] font-black text-[#715800] uppercase block mb-2 tracking-widest">
                    Age Restriction
                  </label>
                  <select
                    value={ageRestriction}
                    onChange={(e) => setAgeRestriction(e.target.value)}
                    className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-xs font-bold outline-none appearance-none"
                  >
                    <option className="bg-gray-900">All Ages</option>
                    <option className="bg-gray-900">18+</option>
                    <option className="bg-gray-900">21+</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-[#715800] uppercase block mb-2 tracking-widest">
                    Refund Policy
                  </label>
                  <select
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value as any)}
                    className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-xs font-bold outline-none appearance-none"
                  >
                    <option value="none" className="bg-gray-900">
                      Non-refundable
                    </option>
                    <option value="flexible" className="bg-gray-900">
                      Flexible (Full)
                    </option>
                    <option value="24h" className="bg-gray-900">
                      24h Limit
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-10 py-5 bg-[#715800] text-white rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl shadow-[#715800]/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Submit
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <div className="mt-6 flex items-start gap-2 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Info size={14} className="text-[#715800] shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Your event will be broadcasted to users in Port Harcourt based
                on your location pin.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-5xl h-[80vh] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white"
          >
            <div className="absolute top-6 left-6 z-10 bg-white p-5 rounded-[28px] shadow-xl border border-gray-100 max-w-xs">
              <h2 className="text-xl font-black tracking-tighter">
                Pin the Move
              </h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">
                Port Harcourt Discovery
              </p>
            </div>
            <button
              onClick={() => setShowMapPicker(false)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold shadow-lg"
            >
              <X size={24} />
            </button>
            <CreateEventMap
              ref={mapRef}
              selectedCoords={locationCoords}
              onSelect={setLocationCoords}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-12 py-4 bg-[#715800] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-2xl"
              >
                Set This Location
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Auth Modal Placeholder */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-[#715800]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="text-[#715800]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">
                Join Kivo
              </h2>
              <p className="text-gray-500 text-sm mb-8 font-medium">
                You need an account to broadcast events to the city.
              </p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest mb-3"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-4 text-gray-400 font-bold text-xs"
              >
                Maybe Later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MobileNav />
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
