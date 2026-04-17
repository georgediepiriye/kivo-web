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
  Trash2,
  X,
  Loader2,
  Plus,
  Ticket,
  Info,
  Hash,
  Link as LinkIcon,
  Video,
  Globe,
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
  const [type, setType] = useState<"activity" | "showcase">("activity");
  const [eventFormat, setEventFormat] = useState<
    "physical" | "online" | "hybrid"
  >("physical");

  // Date/Time
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // Links
  const [externalTicketLink, setExternalTicketLink] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Location State
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Media & Ticketing
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ticketingType, setTicketingType] = useState<
    "none" | "internal" | "external"
  >("none");
  const [ticketTiers, setTicketTiers] = useState<ITicketTier[]>([]);

  // Advanced Settings
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

  const addTier = () => {
    setTicketTiers([
      ...ticketTiers,
      { name: "General Admission", price: 0, capacity: 50, description: "" },
    ]);
  };
  const removeTier = (index: number) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
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
    if (!isLoggedIn) return setShowAuthModal(true);
    if (!title || !category || !startDate)
      return toast.error("Missing basic details.");
    if (eventFormat !== "online" && !locationCoords)
      return toast.error("Please pin the location.");
    if (eventFormat !== "physical" && !meetingLink)
      return toast.error("Meeting link is required.");

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
        endDate: new Date(`${endDate}T${endTime || "23:59"}`).toISOString(),
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
        ticketTiers: ticketingType === "none" ? [] : ticketTiers,
        isFree:
          ticketingType === "none" ||
          (ticketingType === "internal" &&
            ticketTiers.every((t) => t.price === 0)),
        joinLink,
        meetingLink,
        externalTicketLink,
        isPublic,
        allowAnonymous,
        ageRestriction,
        refundPolicy,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
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
      toast.success("Move is live!");
      router.push("/map");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900">
      <Toaster position="bottom-center" />
      <Navbar />

      <header className="pt-28 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-[10px] font-black uppercase mb-4">
          ✨ Host a New Move
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 uppercase">
          Create{" "}
          <span className="text-[#715800]">
            {type === "showcase" ? "Event" : "Activity"}
          </span>
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex p-1.5 bg-gray-100 rounded-3xl border border-gray-200">
            {[
              { value: "activity", label: "Activity" },
              { value: "showcase", label: "Event" }, // Value is 'showcase', Label is 'Event'
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value as any)}
                className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all ${
                  type === t.value
                    ? "bg-white text-[#715800] shadow-md"
                    : "text-gray-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="inline-flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
            {["physical", "online", "hybrid"].map((f) => (
              <button
                key={f}
                onClick={() => setEventFormat(f as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  eventFormat === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {f === "online" ? <Video size={14} /> : <Globe size={14} />} {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: The Basics */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                1
              </div>
              The Basics
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none font-medium"
              />
              <textarea
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none h-40 resize-none transition-all"
              />
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block ml-1">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${
                        category === cat
                          ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                          : "border-gray-50 text-gray-400 bg-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Logistics */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                2
              </div>
              Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Start Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-2/5 bg-gray-50 p-4 rounded-2xl outline-none font-bold"
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
                    className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-2/5 bg-gray-50 p-4 rounded-2xl outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {eventFormat !== "online" && (
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black uppercase text-gray-400 block ml-1">
                  Venue Location
                </label>
                <SearchBox
                  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                  value={location}
                  onChange={(val) => setLocation(val)}
                  onRetrieve={handleRetrieve}
                  placeholder="Physical Venue Address"
                  options={{ proximity: [7.0354, 4.8156], country: "NG" }}
                  theme={{
                    variables: {
                      borderRadius: "24px",
                      unit: "16px",
                      border: "none",
                      boxShadow: "none",
                    },
                  }}
                />
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="w-full py-4 bg-gray-900 text-white font-black text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-black"
                >
                  <MapPin size={16} />{" "}
                  {locationCoords ? "Pin Set ✓" : "Set Precise Pin on Map"}
                </button>
              </div>
            )}

            {eventFormat !== "physical" && (
              <div className="pt-4 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 block ml-1">
                  Meeting Access
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Meeting Link (Zoom, Meet, etc.)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-[#715800] outline-none font-medium"
                  />
                  <Video
                    size={16}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Ticketing */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                3
              </div>
              Ticketing Flow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "none",
                  label: "No Tickets",
                  icon: Users,
                  sub: "Group Join",
                },
                {
                  id: "internal",
                  label: "Kivo Tickets",
                  icon: Ticket,
                  sub: "Free/Paid",
                },
                {
                  id: "external",
                  label: "External",
                  icon: LinkIcon,
                  sub: "Off-platform",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTicketingType(opt.id as any)}
                  className={`p-4 rounded-[24px] border-2 text-left transition-all ${
                    ticketingType === opt.id
                      ? "border-[#715800] bg-[#715800]/5"
                      : "border-gray-50 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <opt.icon
                    size={18}
                    className={
                      ticketingType === opt.id
                        ? "text-[#715800]"
                        : "text-gray-400"
                    }
                  />
                  <p className="font-black text-[10px] uppercase mt-2">
                    {opt.label}
                  </p>
                  <p className="text-[9px] text-gray-500">{opt.sub}</p>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {ticketingType === "internal" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 relative grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                          Tier Name
                        </label>
                        <input
                          value={tier.name}
                          onChange={(e) =>
                            updateTier(idx, "name", e.target.value)
                          }
                          className="w-full bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) =>
                            updateTier(idx, "price", Number(e.target.value))
                          }
                          className="w-full bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={tier.capacity}
                          onChange={(e) =>
                            updateTier(idx, "capacity", Number(e.target.value))
                          }
                          className="w-full bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                        />
                      </div>
                      <button
                        onClick={() => removeTier(idx)}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTier}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#715800] hover:border-[#715800] transition-all"
                  >
                    + Add Ticket Tier
                  </button>
                </motion.div>
              )}

              {ticketingType === "external" && (
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Paste External Ticket Link"
                    value={externalTicketLink}
                    onChange={(e) => setExternalTicketLink(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-[#715800] outline-none font-medium text-sm"
                  />
                  <LinkIcon
                    size={16}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                </div>
              )}

              {ticketingType === "none" && (
                <input
                  type="url"
                  placeholder="Group Join Link (WhatsApp/Telegram)"
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:border-[#715800] outline-none font-medium text-sm"
                />
              )}
            </AnimatePresence>
          </section>

          {/* Section 4: Visuals */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800] text-xs">
                4
              </div>
              Visuals
            </h3>
            <div className="relative border-4 border-dashed border-gray-100 rounded-[32px] p-2 text-center group hover:border-[#715800]/20 transition-all">
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
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-gray-200" />
                  </div>
                  <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                    Upload Event Banner
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

        {/* Sidebar Controls (Advanced Settings) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 text-white rounded-[40px] p-8 sticky top-28 shadow-2xl border-t-8 border-[#715800]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#715800] mb-8">
              Advanced Settings
            </h4>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Public Move
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Visible to everyone
                  </p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full relative transition-all ${isPublic ? "bg-[#715800]" : "bg-white/10"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Anon Join
                  </p>
                  <p className="text-[10px] text-gray-500">
                    No account required
                  </p>
                </div>
                <button
                  onClick={() => setAllowAnonymous(!allowAnonymous)}
                  className={`w-12 h-6 rounded-full relative transition-all ${allowAnonymous ? "bg-[#715800]" : "bg-white/10"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowAnonymous ? "right-1" : "left-1"}`}
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
              className="w-full mt-10 py-5 bg-[#715800] text-white rounded-[28px] font-black text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Submit <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Map Picker Modal */}
      <AnimatePresence>
        {showMapPicker && (
          <div className="fixed inset-0 z-[110] bg-white flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <div className="flex flex-col">
                <h2 className="font-black text-xl uppercase tracking-tighter">
                  Set Precise Pin
                </h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase">
                  {location || "Drop a pin on the map"}
                </p>
              </div>
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-8 py-3 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-black transition-all"
              >
                Save & Close
              </button>
            </div>
            <div className="flex-1 relative">
              <CreateEventMap
                ref={mapRef}
                selectedCoords={locationCoords}
                onSelect={(coords: { lat: number; lng: number }) =>
                  setLocationCoords(coords)
                }
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl text-center"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-20 h-20 bg-[#715800]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#715800]">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">
                Authentication Required
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
                You need to be logged in to host a move on Kivo.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full py-4 bg-[#715800] text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="w-full py-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
