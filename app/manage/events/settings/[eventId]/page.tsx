/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Loader2,
  MapPin,
  Calendar,
  Ticket,
  Info,
  Navigation,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  ShieldAlert,
  Type,
  AlignLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Navbar from "@/components/layout/NavBar";
import AuthGuard from "@/components/auth/AuthGuard";

// Types
interface MapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onSelect: (coords: { lat: number; lng: number }) => void;
}

// Dynamic Imports
const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-slate-50 animate-pulse rounded-2xl" />
    ),
  },
);

const CreateEventMap = dynamic<MapProps>(
  () => import("@/components/map/CreateEventMap"),
  { ssr: false },
);

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    isPublic: true,
    startDate: "",
    endDate: "",
    isRecurring: false,
    recurrenceFrequency: "weekly",
    location: "",
    neighborhood: "",
    locationCoords: null,
    status: "active",
    ticketTiers: [],
  });

  const hasStarted = formData.startDate
    ? new Date(formData.startDate) <= new Date()
    : false;

  // 1. Data Fetching
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.eventId}`,
          {
            credentials: "include",
          },
        );
        const result = await res.json();
        if (res.ok) {
          const event = result.data.event;
          setFormData({
            title: event.title || "",
            description: event.description || "",
            isPublic: event.isPublic ?? true,
            startDate: event.startDate
              ? new Date(event.startDate).toISOString().slice(0, 16)
              : "",
            endDate: event.endDate
              ? new Date(event.endDate).toISOString().slice(0, 16)
              : "",
            isRecurring: event.isRecurring || false,
            recurrenceFrequency: event.recurrenceFrequency || "weekly",
            location: event.location?.address || "",
            neighborhood: event.location?.neighborhood || "",
            locationCoords: event.location?.coordinates
              ? {
                  lng: event.location.coordinates[0],
                  lat: event.location.coordinates[1],
                }
              : null,
            status: event.status,
            ticketTiers: event.ticketTiers || [],
          });
        }
      } catch (e) {
        toast.error("Failed to load Move");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [params.eventId]);

  // 2. Logic Handlers
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("GPS not supported");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
        toast.success("Location Updated");
      },
      () => {
        setIsLocating(false);
        toast.error("Access denied");
      },
      { enableHighAccuracy: true },
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,neighborhood`,
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const feature = data.features[0];
        setFormData((prev: any) => ({
          ...prev,
          location: feature.place_name,
          neighborhood:
            feature.context?.find((c: any) => c.id.startsWith("neighborhood"))
              ?.text || "",
          locationCoords: { lat, lng },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
        location: {
          address: formData.location,
          neighborhood: formData.neighborhood,
          type: "Point",
          coordinates: formData.locationCoords
            ? [formData.locationCoords.lng, formData.locationCoords.lat]
            : undefined,
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.eventId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Update failed");
      toast.success("Move Updated Successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#715800] mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Syncing with Kivo...
        </p>
      </div>
    );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-32">
        <Toaster position="bottom-center" />
        <Navbar />

        {/* HEADER */}
        <div className="pt-24 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-[10px] font-black uppercase tracking-widest text-[#715800]">
                  Control Center
                </h1>
                <p className="text-xl font-black uppercase tracking-tight">
                  {formData.title || "Untitled Move"}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-10 py-4 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* 1. BASIC INFO */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={16} /> Basic Details
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <Type size={12} /> Move Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-transparent focus:border-[#715800]/20 rounded-2xl text-sm font-bold outline-none transition-all"
                    placeholder="E.g. Port Harcourt Night Run"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                    <AlignLeft size={12} /> Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-transparent focus:border-[#715800]/20 rounded-2xl text-sm font-bold outline-none transition-all resize-none"
                    placeholder="Tell them what's happening..."
                  />
                </div>

                <div className="pt-4 flex items-center justify-between bg-slate-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${formData.isPublic ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-600"}`}
                    >
                      {formData.isPublic ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">
                        Visibility
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {formData.isPublic
                          ? "Visible to everyone on Kivo"
                          : "Private / Invite Only"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, isPublic: !formData.isPublic })
                    }
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.isPublic ? "border-green-200 text-green-600 bg-white" : "border-slate-200 text-slate-500 bg-white"}`}
                  >
                    {formData.isPublic ? "Make Private" : "Make Public"}
                  </button>
                </div>
              </div>
            </section>

            {/* 2. SCHEDULE */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Calendar size={16} /> Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Start Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    disabled={hasStarted}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    End Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold"
                  />
                </div>
              </div>
            </section>

            {/* 3. LOCATION */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={16} /> Venue
                </h3>
                {!hasStarted && (
                  <button
                    onClick={useCurrentLocation}
                    className="text-[10px] font-black text-[#715800] flex items-center gap-1"
                  >
                    <Navigation
                      size={12}
                      className={isLocating ? "animate-pulse" : ""}
                    />{" "}
                    {isLocating ? "Locating..." : "Use GPS"}
                  </button>
                )}
              </div>

              <div
                className={hasStarted ? "pointer-events-none opacity-50" : ""}
              >
                <SearchBox
                  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                  value={formData.location}
                  onRetrieve={(res: any) => {
                    const feature = res.features[0];
                    setFormData((prev: any) => ({
                      ...prev,
                      location: feature.properties.full_address,
                      neighborhood:
                        feature.properties.context?.neighborhood?.name || "",
                      locationCoords: {
                        lng: feature.geometry.coordinates[0],
                        lat: feature.geometry.coordinates[1],
                      },
                    }));
                  }}
                />
              </div>
              <button
                disabled={hasStarted}
                onClick={() => setShowMapPicker(true)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
              >
                {formData.locationCoords ? "Adjust Pin on Map" : "Drop Map Pin"}
              </button>
            </section>

            {/* 4. TICKETS */}
            <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Ticket size={16} /> Tickets
                </h3>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      ticketTiers: [
                        ...formData.ticketTiers,
                        { name: "New Tier", price: 0, capacity: 50 },
                      ],
                    })
                  }
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-2"
                >
                  <Plus size={12} /> Add Tier
                </button>
              </div>
              <div className="space-y-4">
                {formData.ticketTiers.map((tier: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 bg-slate-50 rounded-[2rem] grid grid-cols-1 md:grid-cols-3 gap-6 relative border border-slate-100 group"
                  >
                    <input
                      value={tier.name}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent font-bold text-sm outline-none"
                      placeholder="Tier Name"
                    />

                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].price = Number(e.target.value);
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent font-bold text-sm outline-none"
                      placeholder="Price"
                    />

                    <input
                      type="number"
                      value={tier.capacity}
                      onChange={(e) => {
                        const updated = [...formData.ticketTiers];
                        updated[idx].capacity = Number(e.target.value);
                        setFormData({ ...formData, ticketTiers: updated });
                      }}
                      className="bg-transparent font-bold text-sm outline-none"
                      placeholder="Capacity"
                    />

                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          ticketTiers: formData.ticketTiers.filter(
                            (_: any, i: number) => i !== idx,
                          ),
                        })
                      }
                      className="absolute -top-2 -right-2 bg-white p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-10 space-y-8 text-white">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <CreditCard size={14} /> Stats
              </h3>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Tickets Sold
                </p>
                <p className="text-4xl font-black mt-1">
                  {formData.ticketTiers?.reduce(
                    (acc: any, t: any) => acc + (t.sold || 0),
                    0,
                  )}
                </p>
              </div>
              <button className="w-full py-5 bg-[#715800] rounded-2xl font-black text-[10px] uppercase tracking-widest">
                Request Payout
              </button>
            </div>

            <div className="bg-red-50/50 rounded-[2.5rem] border border-red-100 p-8">
              <h3 className="text-[10px] font-black uppercase text-red-500 mb-4 flex items-center gap-2">
                <ShieldAlert size={14} /> Danger Zone
              </h3>
              <button className="w-full py-4 bg-white border border-red-200 text-red-500 rounded-2xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">
                Cancel Move
              </button>
            </div>
          </aside>
        </main>
      </div>

      {/* MAP MODAL */}
      <AnimatePresence>
        {showMapPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="absolute top-6 right-6 z-[110]">
              <button
                onClick={() => setShowMapPicker(false)}
                className="p-4 bg-black text-white rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1">
              <CreateEventMap
                selectedCoords={formData.locationCoords}
                onSelect={(coords) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    locationCoords: coords,
                  }));
                  reverseGeocode(coords.lat, coords.lng);
                }}
              />
            </div>
            <div className="p-10 bg-white border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-12 py-5 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl"
              >
                Confirm Pin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthGuard>
  );
}
