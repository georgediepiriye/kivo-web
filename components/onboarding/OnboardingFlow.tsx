/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  MapPin,
  Mail,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
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
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationRequest = useCallback(async () => {
    setStatus("requesting");

    const saveAndMove = (lat: number, lng: number) => {
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
      (pos) => saveAndMove(pos.coords.latitude, pos.coords.longitude),
      async () => {
        const fallback = await getIPLocation();
        saveAndMove(fallback.lat, fallback.lng);
      },
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }, []);

  const completeOnboarding = (targetPath?: string) => {
    localStorage.setItem("kivo_onboarded", "true");
    setIsVisible(false);
    if (targetPath) {
      // If targetPath is /auth/google, use window.location for the server redirect
      if (targetPath.includes("google")) {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/google`;
      } else {
        router.push(targetPath);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-zinc-900/40 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white w-full md:max-w-4xl h-[85vh] md:h-auto md:min-h-[540px] rounded-t-[40px] md:rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* Header/Close Logic */}
          <button
            onClick={() => completeOnboarding()}
            className="absolute top-6 right-6 z-20 p-2.5 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>

          {step === 1 ? (
            <>
              {/* LEFT: Visual Showcase */}
              <div className="w-full md:w-1/2 bg-[#F9F7F2] p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#715800]/5 rounded-full blur-3xl" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full aspect-square max-w-[280px]"
                >
                  <Image
                    src="/images/location.jpeg"
                    alt="Map Discovery"
                    fill
                    className="object-cover rounded-[40px] shadow-2xl rotate-3"
                  />
                </motion.div>
              </div>

              {/* RIGHT: Action Section */}
              <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
                <span className="text-[#715800] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                  Discovery Mode
                </span>
                <h2 className="text-4xl font-black mb-6 text-zinc-900 tracking-tighter leading-[0.95]">
                  Experience the city <br />
                  <span className="italic text-[#715800]">in Real-Time.</span>
                </h2>

                <p className="text-zinc-500 mb-10 text-sm font-medium leading-relaxed max-w-[300px]">
                  Join the movement. Enable location to see active lounges,
                  trending spots, and private events near you.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleLocationRequest}
                    disabled={status === "requesting" || status === "success"}
                    className="group w-full py-5 bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {status === "requesting" ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : status === "success" ? (
                      <ShieldCheck size={18} className="text-emerald-400" />
                    ) : (
                      <MapPin
                        size={18}
                        className="group-hover:animate-bounce"
                      />
                    )}
                    {status === "requesting"
                      ? "Locating..."
                      : status === "success"
                        ? "Location Active"
                        : "Allow Access"}
                  </button>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-[#715800] transition-colors py-2"
                  >
                    Enter Manually
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* LEFT: Branding/Atmosphere */}
              <div className="w-full md:w-1/2 bg-zinc-900 p-12 flex flex-col justify-between text-white relative">
                <div className="absolute inset-0 opacity-40">
                  <Image
                    src="/images/signin.jpeg"
                    alt="Vibe"
                    fill
                    className="object-cover grayscale"
                  />
                </div>
                <div className="relative z-10">
                  <p className="text-[#715800] font-black text-2xl tracking-tighter">
                    KIVO
                  </p>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black italic leading-tight tracking-tighter mb-4">
                    The Night is <br /> Still Young.
                  </h3>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-1 bg-white/20 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Authentication Options */}
              <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
                <h2 className="text-2xl font-black mb-2 text-zinc-900">
                  Get Started
                </h2>
                <p className="text-zinc-400 text-xs font-medium mb-10">
                  Choose your preferred entry method.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => completeOnboarding("/auth/google")}
                    className="w-full py-4 border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-zinc-800 hover:bg-zinc-50 transition-all active:scale-[0.98]"
                  >
                    <Image
                      src="/images/google_icon.png"
                      width={20}
                      height={20}
                      alt="Google"
                      className="object-contain" // Replaces the specific sizing needs
                    />
                    <span className="text-[11px] uppercase tracking-widest">
                      Continue with Google
                    </span>
                  </button>

                  <button
                    onClick={() => completeOnboarding("/auth/signin")}
                    className="w-full py-4 bg-zinc-50 border-2 border-transparent rounded-2xl flex items-center justify-center gap-4 font-bold text-zinc-800 hover:border-zinc-200 transition-all active:scale-[0.98]"
                  >
                    <Mail size={18} className="text-zinc-400" />
                    <span className="text-[11px] uppercase tracking-widest">
                      Email Access
                    </span>
                  </button>

                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-zinc-100 flex-1" />
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                      or
                    </span>
                    <div className="h-px bg-zinc-100 flex-1" />
                  </div>

                  <button
                    onClick={() => completeOnboarding("/map")}
                    className="group w-full py-5 bg-[#715800] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-[#715800]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Explore as Guest
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>

                <p className="mt-10 text-[9px] text-zinc-400 font-bold text-center uppercase tracking-tighter">
                  Secure access powered by{" "}
                  <span className="text-zinc-900">Kivo Cloud</span>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
