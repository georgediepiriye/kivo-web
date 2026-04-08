/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import CreateEventMap, { MapRef } from "@/components/map/CreateEventMap";
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Users,
  Lock,
  ChevronRight,
  Trash2,
  Sparkles,
} from "lucide-react";

const categories = [
  "Music",
  "Sports",
  "Education",
  "Technology",
  "Food & Drink",
  "Networking",
  "Health & Fitness",
  "Other",
];

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
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

  const [type, setType] = useState<"event" | "activity">("activity");
  const [fee, setFee] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");

  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

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
    if (!locationCoords) return alert("Please pin the location on the map.");
    setSubmitting(true);
    // ... Logic stays same
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900">
      <Navbar />

      {/* Page Header Area */}
      <header className="pt-28 pb-12 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Create a vibe
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-6">
          Host an{" "}
          <span className="text-[#715800]">
            {type === "event" ? "Event" : "Activity"}
          </span>
        </h1>

        {/* Premium Toggle */}
        <div className="inline-flex p-1.5 bg-gray-100 rounded-3xl border border-gray-200 shadow-inner">
          {["activity", "event"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t as any)}
              className={`px-8 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
                type === t
                  ? "bg-white text-[#715800] shadow-md ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Card: Basic Info */}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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

          {/* Card: Logistics */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#715800]/10 flex items-center justify-center text-[#715800]">
                2
              </div>
              Logistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Date
                </label>
                <Calendar
                  className="absolute right-5 top-[44px] text-gray-300"
                  size={20}
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium"
                />
              </div>
              <div className="relative">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Time
                </label>
                <Clock
                  className="absolute right-5 top-[44px] text-gray-300"
                  size={20}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2 relative">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Location
                </label>
                <MapPin
                  className="absolute left-5 top-[44px] text-gray-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Enter a venue name or street"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-[#715800] outline-none transition-all font-medium"
                />
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="mt-3 w-full py-3 bg-[#715800]/5 text-[#715800] font-black text-xs uppercase tracking-widest rounded-xl border border-[#715800]/20 hover:bg-[#715800]/10 transition"
                >
                  Pin on Map {locationCoords && "✓"}
                </button>
              </div>
            </div>
          </section>

          {/* Card: Media */}
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

        {/* Right Side: Sticky Settings & Submit */}
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
                className="w-full mt-10 py-5 bg-[#715800] text-white font-black rounded-[28px] shadow-xl shadow-[#715800]/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                {submitting ? "Launching..." : "Broadcast Event"}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </section>

            <div className="bg-blue-50 p-6 rounded-[32px] flex items-start gap-4 border border-blue-100">
              <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#715800] uppercase tracking-wider">
                  Be the Plug
                </p>
                <p className="text-[10px] text-[#715800]/70 leading-relaxed font-medium mt-1">
                  Top hosts get featured in our weekly "Scout's Choice" feed.
                  Make this move count!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Integrated Map Picker Modal */}
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
