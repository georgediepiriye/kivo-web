/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Loader2, MapPin, Mail, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getIPLocation } from "@/lib/locationUtils";

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "requesting" | "error" | "success"
  >("idle");

  useEffect(() => {
    const hasSeen = localStorage.getItem("kivo_onboarded");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationRequest = useCallback(async () => {
    setStatus("requesting");
    const safetyTimer = setTimeout(async () => {
      if (status === "requesting") {
        const fallback = await getIPLocation();
        saveAndMove(fallback.lat, fallback.lng);
      }
    }, 6000);

    const saveAndMove = (lat: number, lng: number) => {
      clearTimeout(safetyTimer);
      const coords =
        isNaN(lat) || isNaN(lng) ? { lat: 4.8156, lng: 7.0498 } : { lat, lng };
      localStorage.setItem("user_coords", JSON.stringify(coords));
      setStatus("success");
      setTimeout(() => setStep(2), 1000);
    };

    if (!navigator.geolocation) {
      const fallback = await getIPLocation();
      saveAndMove(fallback.lat, fallback.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        saveAndMove(position.coords.latitude, position.coords.longitude),
      async () => {
        const fallback = await getIPLocation();
        saveAndMove(fallback.lat, fallback.lng);
      },
      { enableHighAccuracy: false, timeout: 5500, maximumAge: 300000 },
    );
  }, [status]);

  const completeOnboarding = (targetPath?: string) => {
    localStorage.setItem("kivo_onboarded", "true");
    setIsVisible(false);
    if (targetPath) router.push(targetPath);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // CHANGED: From bg-zinc-950/90 (dark) to a light glass effect
        className="fixed inset-0 z-[500] bg-white/40 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          // CHANGED: Added border and stronger shadow for contrast against light background
          className="bg-white w-full md:max-w-2xl max-h-[92vh] md:max-h-[85vh] rounded-t-[40px] md:rounded-[48px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-white flex flex-col overflow-hidden relative"
        >
          {/* Close for Guest Experience */}
          <button
            onClick={() => completeOnboarding()}
            className="absolute top-6 right-6 z-20 p-2 bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors md:block hidden"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {step === 1 ? (
              <div className="flex flex-col md:flex-row h-full">
                {/* Visual Side */}
                <div className="w-full md:w-1/2 bg-zinc-50 p-8 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-100">
                  <div className="absolute inset-0 bg-[#715800]/5 rounded-full blur-3xl scale-150" />
                  <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <Image
                      src="/images/location.jpeg"
                      alt="Discovery"
                      fill
                      priority
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                  <h2 className="text-3xl font-black mb-4 text-zinc-900 tracking-tighter italic leading-tight">
                    See What's Live.
                  </h2>
                  <p className="text-zinc-500 mb-8 text-sm font-medium leading-relaxed">
                    Kivo maps out events in real-time. Enable location to find
                    the best vibes{" "}
                    <span className="text-zinc-900 font-bold underline decoration-[#715800]/20 underline-offset-4">
                      right where you are.
                    </span>
                  </p>

                  <div
                    className={`p-4 rounded-3xl mb-8 border transition-all flex items-center gap-4 ${
                      status === "success"
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-zinc-50 border-zinc-100"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      {status === "requesting" ? (
                        <Loader2
                          className="animate-spin text-[#715800]"
                          size={18}
                        />
                      ) : status === "success" ? (
                        <ShieldCheck className="text-emerald-500" size={20} />
                      ) : (
                        <MapPin className="text-[#715800]" size={18} />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 truncate">
                        {status === "requesting"
                          ? "Syncing..."
                          : status === "success"
                            ? "Located"
                            : "Privacy First"}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-bold truncate">
                        Precise discovery active.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleLocationRequest}
                      disabled={status === "requesting" || status === "success"}
                      className="w-full py-5 bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {status === "requesting"
                        ? "Connecting..."
                        : "Enable Access"}
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-3 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 transition-colors"
                    >
                      Set Manually
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {/* Visual Side */}
                <div className="w-full md:w-1/2 bg-[#715800] p-12 flex flex-col items-center justify-center text-white text-center">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center text-5xl mb-6 shadow-2xl">
                    🍸
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter">
                    The Full Experience
                  </h3>
                  <p className="text-white/70 text-xs mt-2 font-medium max-w-[200px]">
                    Unlock exclusive tickets and follow your favorite hosts.
                  </p>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                  <div className="space-y-4">
                    <button
                      onClick={() => completeOnboarding("/auth/google")}
                      className="w-full py-4 border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-3 font-black text-zinc-800 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
                    >
                      <Image
                        src="/images/google_icon.png"
                        width={18}
                        height={18}
                        alt="G"
                      />
                      <span className="text-[10px] uppercase tracking-widest">
                        Google Account
                      </span>
                    </button>

                    <button
                      onClick={() => completeOnboarding("/auth/signin")}
                      className="w-full py-4 border-2 border-[#715800]/10 rounded-2xl flex items-center justify-center gap-3 font-black text-[#715800] hover:bg-[#715800]/5 transition-all active:scale-95"
                    >
                      <Mail size={18} />
                      <span className="text-[10px] uppercase tracking-widest">
                        Email Sign In
                      </span>
                    </button>

                    <div className="relative py-4 flex items-center gap-4">
                      <div className="h-px bg-zinc-100 flex-1" />
                      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tighter">
                        or
                      </span>
                      <div className="h-px bg-zinc-100 flex-1" />
                    </div>

                    <button
                      onClick={() => completeOnboarding()}
                      className="w-full py-5 bg-zinc-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all"
                    >
                      Explore as Guest
                    </button>
                  </div>

                  <p className="mt-8 text-[9px] text-zinc-400 font-bold text-center leading-tight px-4">
                    By entering Kivo, you agree to our{" "}
                    <span className="underline text-zinc-900">Terms</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
