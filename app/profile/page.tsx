"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Zap,
  Plus,
  MessageCircle,
  LogOut,
  Share2,
  Trophy,
  History,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/profile`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (response.ok && result.status === "success") {
          setProfile(result.data);
          setLoading(false);
        } else {
          // If not authenticated, redirect immediately
          router.replace("/auth/signin");
        }
      } catch (error) {
        console.error("Profile Load Error:", error);
        router.replace("/auth/signin");
      }
    };

    fetchProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.clear();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed");
    }
  };

  // --- FIX: SECURE LOADING STATE ---
  // While loading is true, we return a full-screen loader.
  // This prevents unauthenticated users from seeing the layout.
  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#FDFDFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#715800]/10 rounded-3xl" />
            <div className="absolute inset-0 border-4 border-t-[#715800] rounded-3xl animate-spin" />
          </div>
          <p className="text-[#715800] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Authenticating Kivo ID
          </p>
        </div>
      </div>
    );
  }

  // --- DATA MAPPING ---
  const userDisplay = {
    name: profile?.name || "Kivo User",
    email: profile?.email,
    handle: `@${profile?.name?.toLowerCase().replace(/\s/g, "") || "kivo_member"}`,
    location: profile?.location?.city || "Port Harcourt",
    image: profile?.image || "/images/profile.jpg",
    joined: new Date(profile?.createdAt).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    }),
    interests:
      profile?.interests?.length > 0
        ? profile.interests
        : ["Live Music", "Port Harcourt Vibes", "Networking"],
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-[#715800]/20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR --- */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-32">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[#715800] to-[#f8d472] rounded-[2.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                  <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-slate-50">
                    <Image
                      src={userDisplay.image}
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
                      {userDisplay.name}
                    </h2>
                    <ShieldCheck
                      size={18}
                      className="text-blue-500"
                      fill="currentColor"
                      fillOpacity={0.1}
                    />
                  </div>
                  <p className="text-[#715800] font-bold tracking-wide">
                    {userDisplay.handle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-4 px-4 py-1.5 bg-slate-50 rounded-full text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <MapPin size={12} /> {userDisplay.location}
                </div>

                <div className="grid grid-cols-3 w-full gap-2 mt-8">
                  <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                    <p className="text-lg font-black">0</p>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Calendar size={14} /> Events
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                    <p className="text-lg font-black">100</p>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Trophy size={14} /> Points
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                    <p className="text-lg font-black">PH</p>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Zap size={14} /> OG
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3 mt-8">
                  <button className="w-full py-4 bg-[#715800] text-white rounded-2xl font-black text-sm shadow-[0_10px_20px_rgba(113,88,0,0.2)] active:scale-95 transition-all">
                    Edit Profile
                  </button>
                  <button className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition">
                    <Share2 size={16} className="inline mr-2" /> Share
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* --- RIGHT CONTENT --- */}
          <section className="lg:col-span-8 space-y-8">
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
                      Smart Alerts
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">WhatsApp Sync</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-[200px]">
                    Get PH moves sent directly to your phone.
                  </p>
                  <button className="px-6 py-2.5 bg-white text-black rounded-full font-black text-xs hover:bg-[#25D366] hover:text-white transition-colors">
                    Setup Now
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#715800]" />{" "}
                    Interests
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userDisplay.interests.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-slate-50 text-slate-800 border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-tight hover:border-[#715800] transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <History size={32} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black tracking-tight">
                No History Found
              </h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                Events you attend or host in Port Harcourt will appear here.
              </p>
              <button className="mt-8 px-10 py-4 bg-[#715800] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#715800]/20 active:scale-95 transition-all">
                Find Moves
              </button>
            </div>

            <div className="flex justify-center pt-8">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-500 transition-colors group"
              >
                <LogOut
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Terminate Session
              </button>
            </div>
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
