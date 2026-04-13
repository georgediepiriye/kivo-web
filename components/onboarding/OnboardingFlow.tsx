/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Lock, AlertCircle, Loader2, MapPin, Mail } from "lucide-react";
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
      const timer = setTimeout(() => setIsVisible(true), 500);
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
      // Extra safety check for NaN/Invalid coords
      if (isNaN(lat) || isNaN(lng)) {
        localStorage.setItem(
          "user_coords",
          JSON.stringify({ lat: 4.8156, lng: 7.0498 }),
        );
      } else {
        localStorage.setItem("user_coords", JSON.stringify({ lat, lng }));
      }
      setStatus("success");
      setTimeout(() => setStep(2), 800);
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
        className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="bg-white w-full max-w-md h-[90vh] md:h-auto md:rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
        >
          {step === 1 ? (
            <div className="p-8 flex flex-col items-center text-center flex-1 justify-center">
              <div className="relative w-48 h-48 mb-8">
                <Image
                  src="/images/location.jpeg"
                  alt="Discovery"
                  fill
                  priority
                  sizes="(max-width: 768px) 192px, 192px"
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-black mb-4 text-gray-900 italic tracking-tighter">
                See What's Live.
              </h2>
              <p className="text-gray-500 mb-10 text-sm leading-relaxed px-6 font-medium">
                Kivo maps out events in real-time. Enable location to find the
                best vibes{" "}
                <span className="text-black font-bold underline decoration-[#715800]/30">
                  right where you are.
                </span>
              </p>

              <div
                className={`w-full p-5 rounded-[24px] mb-8 border transition-all flex items-center gap-4 text-left ${
                  status === "success"
                    ? "bg-green-50 border-green-100"
                    : "bg-gray-50 border-gray-200/60"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white shadow-sm">
                  {status === "requesting" ? (
                    <Loader2
                      className="animate-spin text-[#715800]"
                      size={24}
                    />
                  ) : status === "success" ? (
                    <MapPin className="text-green-600" size={24} />
                  ) : (
                    <Lock className="text-[#715800]" size={24} />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-900">
                    {status === "requesting"
                      ? "Syncing Radar..."
                      : status === "success"
                        ? "Signal Secured"
                        : "Privacy First"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
                    {status === "requesting"
                      ? "Finding events in Port Harcourt..."
                      : "We only use your location while the app is open."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLocationRequest}
                disabled={status === "requesting" || status === "success"}
                className="w-full py-5 font-black text-xs uppercase tracking-[0.25em] rounded-[24px] mb-4 bg-[#715800] text-white shadow-lg shadow-[#715800]/20 active:scale-95 transition-all disabled:opacity-70"
              >
                {status === "requesting" ? "Connecting..." : "Allow Access"}
              </button>

              <button
                onClick={() => setStep(2)}
                className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
              >
                Set Location Manually
              </button>
            </div>
          ) : (
            <div className="p-10 flex flex-col items-center text-center flex-1 justify-center">
              <div className="w-20 h-20 bg-[#715800]/10 rounded-3xl flex items-center justify-center text-4xl mb-8 transform rotate-3 shadow-inner">
                🍸
              </div>
              <h2 className="text-4xl font-black mb-4 text-gray-900 tracking-tighter italic">
                Get the Full Access.
              </h2>
              <p className="text-gray-500 mb-10 text-sm font-medium px-4 leading-relaxed">
                Unlock exclusive tickets, save your favorite spots, and follow
                the city's top hosts.
              </p>

              <div className="w-full space-y-4">
                {/* Google Sign In */}
                <button
                  onClick={() => completeOnboarding("/auth/google")}
                  className="w-full py-4 border-2 border-gray-100 rounded-[24px] flex items-center justify-center gap-3 font-black text-gray-800 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  <Image
                    src="/images/google_icon.png"
                    width={20}
                    height={20}
                    alt="G"
                  />
                  <span className="text-xs uppercase tracking-widest">
                    Continue with Google
                  </span>
                </button>

                {/* Email Sign In */}
                <button
                  onClick={() => completeOnboarding("/auth/signin")}
                  className="w-full py-4 border-2 border-[#715800]/20 rounded-[24px] flex items-center justify-center gap-3 font-black text-[#715800] hover:bg-[#715800]/5 transition-all active:scale-95"
                >
                  <Mail size={18} />
                  <span className="text-xs uppercase tracking-widest">
                    Sign in with Email
                  </span>
                </button>

                <div className="flex items-center gap-4 py-3">
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                    Just browsing?
                  </span>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                </div>

                <button
                  onClick={() => completeOnboarding()}
                  className="w-full py-4 bg-black text-white font-black text-xs uppercase tracking-[0.25em] rounded-[24px] shadow-xl shadow-black/10 active:scale-95 transition-all"
                >
                  Explore as Guest
                </button>
              </div>

              <p className="mt-8 text-[9px] text-gray-400 font-medium px-12 leading-tight">
                By entering Kivo, you agree to our{" "}
                <span className="underline text-gray-600">
                  Terms of Service
                </span>
                .
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
