"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Plus,
  ChevronRight,
  MessageCircle,
  LogOut,
  Share2,
  Clock,
  Trophy,
  History,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

export default function ProfilePage() {
  const user = {
    name: "Tari Edwards",
    handle: "@tari_ph",
    location: "GRA Phase 2, Port Harcourt",
    bio: "Always looking for the next live set or garden party in the city. Tech by day, vibe curator by night.",
    stats: [
      { label: "Events", value: "24", icon: <Calendar size={14} /> },
      { label: "Hosting", value: "3", icon: <Zap size={14} /> },
      { label: "Kivo Pts", value: "850", icon: <Trophy size={14} /> },
    ],
    interests: [
      "Live Music",
      "Sunday Brunch",
      "Tech Meetups",
      "Karaoke",
      "Bole Spots",
    ],
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "PH Tech Drinks",
      location: "Woodhouse, GRA",
      time: "8:00 PM",
      date: "12 Apr",
      type: "Networking",
      status: "Confirmed",
    },
    {
      id: 2,
      title: "Sunday Grill & Chill",
      location: "Piazza, PH",
      time: "2:00 PM",
      date: "14 Apr",
      type: "Social",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-[#715800]/20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR: IDENTITY (4 COLUMNS) --- */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-32">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[#715800] to-[#f8d472] rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                    <Image
                      src="/images/profile.jpg"
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-[#715800] hover:scale-110 transition">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="mt-6 space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h2 className="text-2xl font-black tracking-tight uppercase">
                      George Diepiriye
                    </h2>
                    <ShieldCheck
                      size={18}
                      className="text-blue-500"
                      fill="currentColor"
                      fillOpacity={0.1}
                    />
                  </div>
                  <p className="text-[#715800] font-bold tracking-wide">
                    @george_ph
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-4 px-4 py-1.5 bg-slate-50 rounded-full text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <MapPin size={12} />
                  {user.location}
                </div>

                <p className="mt-6 text-sm text-slate-500 leading-relaxed font-medium italic">
                  &ldquo;{user.bio}&rdquo;
                </p>

                <div className="grid grid-cols-3 w-full gap-2 mt-8">
                  {user.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100"
                    >
                      <p className="text-lg font-black">{stat.value}</p>
                      <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        {stat.icon} {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="w-full space-y-3 mt-8">
                  <button className="w-full py-4 bg-[#715800] text-white rounded-2xl font-black text-sm shadow-[0_10px_20px_rgba(113,88,0,0.2)] hover:shadow-none hover:translate-y-0.5 transition-all">
                    Edit Profile
                  </button>
                  <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition">
                    <Share2 size={16} className="inline mr-2" /> Share Profile
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* --- RIGHT CONTENT: DASHBOARD (8 COLUMNS) --- */}
          <section className="lg:col-span-8 space-y-8">
            {/* BENTO ROW: AI & VIBE */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#121212] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition duration-700">
                  <MessageCircle size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#25D366] rounded-xl text-black">
                      <Zap size={16} fill="black" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Assistant Live
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    WhatsApp Smart Alerts
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-[200px]">
                    AI is curating Port Harcourt moves for you.
                  </p>
                  <button className="px-6 py-2.5 bg-white text-black rounded-full font-black text-xs hover:bg-[#25D366] hover:text-white transition-colors">
                    Manage Sync
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#715800]" /> Your
                    Vibe
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    Top Interests
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-50 text-slate-800 border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-tight hover:border-[#715800] transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-100 text-slate-300 hover:text-[#715800] hover:border-[#715800] transition-all">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN ACTIVITY CARD */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Upcoming Moves
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Don&apos;t miss out on these PH experiences.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-tighter text-slate-500 hover:bg-slate-100 transition">
                    <History size={14} className="inline mr-1" /> History
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="relative group p-6 rounded-3xl border border-slate-100 hover:border-[#715800]/20 hover:bg-[#715800]/[0.01] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-[#715800]/5 rounded-2xl flex flex-col items-center justify-center border border-[#715800]/10">
                        <span className="text-[9px] font-black uppercase text-[#715800] opacity-60">
                          {event.date.split(" ")[1]}
                        </span>
                        <span className="text-xl font-black text-[#715800] leading-none">
                          {event.date.split(" ")[0]}
                        </span>
                      </div>

                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-slate-800">
                            {event.title}
                          </h4>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${event.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <MapPin size={13} /> {event.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Clock size={13} /> {event.time}
                          </span>
                          <span className="text-xs font-bold text-[#715800] px-2 py-0.5 bg-[#715800]/5 rounded-md uppercase tracking-tighter">
                            {event.type}
                          </span>
                        </div>
                      </div>

                      <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#715800] transition-colors">
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LOGOUT AREA */}
            <div className="flex justify-center pt-4">
              <button className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-red-500 transition-colors">
                <LogOut size={16} /> Sign Out of Kivo
              </button>
            </div>
          </section>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
