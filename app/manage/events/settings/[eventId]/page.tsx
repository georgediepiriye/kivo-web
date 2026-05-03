/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Trash2,
  Globe,
  Lock,
  Users,
  Bell,
  CreditCard,
  ShieldAlert,
  Loader2,
  Camera,
  MapPin,
  Calendar,
  Ticket,
  ChevronRight,
  Info,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/NavBar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    const fetchEventSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.eventId}`,
          { method: "GET", credentials: "include" },
        );
        const result = await response.json();
        if (response.ok) {
          setEventData(result.data);
        } else {
          toast.error("Failed to load settings");
        }
      } catch (error) {
        console.error("Settings Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventSettings();
  }, [params.eventId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulated API call for UI polish
    setTimeout(() => {
      setSaving(false);
      toast.success("Move settings updated");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#715800]" size={32} />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
        <Toaster position="top-center" />
        <Navbar />

        <div className="pt-24">
          {/* Sub-Header */}
          <div className="max-w-6xl mx-auto px-6 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#715800] hover:border-[#715800]/20 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Move Control Center
                  </h1>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#715800]">
                    {eventData?.status || "Active"}
                  </span>
                </div>
                <p className="text-xl font-black uppercase tracking-tight truncate max-w-[300px]">
                  {eventData?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                Preview Page
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 md:flex-none px-8 py-4 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#5a4600] shadow-lg shadow-[#715800]/20 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Syncing..." : "Save Changes"}
              </button>
            </div>
          </div>

          <main className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* LEFT: MAIN SETTINGS */}
              <div className="lg:col-span-8 space-y-10">
                {/* Visibility Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                    <Globe size={16} className="text-[#715800]" /> Discovery &
                    Privacy
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="relative flex items-center justify-between p-6 bg-white rounded-[2rem] border-2 border-[#715800] cursor-pointer shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                          <Globe size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">
                            Public Move
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            Live on the Kivo Map
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="privacy"
                        defaultChecked
                        className="accent-[#715800] w-5 h-5"
                      />
                    </label>

                    <label className="relative flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-200 cursor-pointer hover:border-slate-300 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                          <Lock size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">
                            Private
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            Link-only Access
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="privacy"
                        className="accent-[#715800] w-5 h-5"
                      />
                    </label>
                  </div>
                </section>

                {/* TICKET TIERS */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Ticket size={16} className="text-[#715800]" /> Admission
                      Tiers
                    </h3>
                    <button className="text-[10px] font-black uppercase text-[#715800] border-b-2 border-[#715800]/10 pb-1">
                      + Add New Tier
                    </button>
                  </div>
                  <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-50">
                      {eventData?.ticketTiers?.map((tier: any, i: number) => (
                        <div
                          key={i}
                          className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase tracking-tight">
                                {tier.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">
                                ₦{tier.price.toLocaleString()} • {tier.quantity}{" "}
                                Slots
                              </p>
                            </div>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      )) || (
                        <div className="p-12 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            No custom tiers configured
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* CORE LOGISTICS */}
                <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info size={16} className="text-[#715800]" /> Logistics
                    Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                        Event Venue
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="text"
                          defaultValue={
                            eventData?.location?.address || "The Rooftop Lounge"
                          }
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#715800] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="datetime-local"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#715800] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">
                      Move Guidelines (Bio)
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={eventData?.description}
                      placeholder="Tell the people the vibe..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:bg-white focus:border-[#715800] outline-none transition-all resize-none"
                    />
                  </div>
                </section>
              </div>

              {/* RIGHT SIDEBAR */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                    <CreditCard size={14} /> Revenue Control
                  </h3>
                  <div className="space-y-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[9px] font-black uppercase text-slate-500">
                        Total Sales
                      </p>
                      <p className="text-2xl font-black mt-1">
                        ₦{((eventData?.attendees || 0) * 5000).toLocaleString()}
                      </p>
                    </div>
                    <button className="w-full py-4 bg-[#715800] hover:bg-[#8e6e00] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                      Request Payout
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <Users size={16} /> Operations
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        router.push(`/manage/scanner/${params.eventId}`)
                      }
                      className="w-full p-5 flex items-center justify-between bg-slate-50 rounded-2xl hover:bg-[#121212] hover:text-white transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Camera
                          size={18}
                          className="text-[#715800] group-hover:text-[#f8d472]"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Open Scanner
                        </span>
                      </div>
                      <ChevronRight size={14} />
                    </button>

                    <button className="w-full p-5 flex items-center justify-between bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <Bell size={18} className="text-[#715800]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Push Alerts
                        </span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-red-50/50 rounded-[2.5rem] border border-red-100 p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} /> Final Actions
                  </h3>
                  <p className="text-[10px] text-red-400 font-bold uppercase leading-relaxed mb-6">
                    Once a move is cancelled, all ticket holders will be
                    notified and sales will be halted immediately.
                  </p>
                  <button className="w-full py-4 bg-white border border-red-200 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all group flex items-center justify-center gap-2">
                    <Trash2 size={14} className="group-hover:animate-bounce" />
                    Cancel Move
                  </button>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
