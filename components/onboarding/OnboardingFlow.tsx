/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const INTERESTS = [
  { id: "party", label: "Nightlife", emoji: "🔥" },
  { id: "food", label: "Food & Drinks", emoji: "🍹" },
  { id: "concert", label: "Concerts", emoji: "🎤" },
  { id: "art", label: "Art & Culture", emoji: "🎨" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "networking", label: "Networking", emoji: "🤝" },
  { id: "shopping", label: "Pop-ups", emoji: "🛍️" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("kivo_onboarded");
    if (!hasSeen) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("kivo_onboarded", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="bg-white w-full max-w-md h-[85vh] md:h-auto md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-6">
                <Image
                  src="/images/location.jpeg"
                  alt="Kivo Bot"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-2xl font-black mb-3 text-gray-900">
                Enable Location
              </h2>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Kivo requires your location to display real-time events and
                activities happening in your area.
              </p>

              <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100 w-full text-left">
                <span className="material-symbols-outlined text-[#715800] mt-0.5">
                  lock
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-none mb-1">
                    Privacy Protected
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Your location data is encrypted and never stored or shared.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigator.geolocation.getCurrentPosition(
                    () => setStep(2),
                    () => setStep(2),
                  )
                }
                className="w-full py-4 bg-[#715800] text-white font-bold rounded-2xl mb-4"
              >
                Allow Access
              </button>
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 text-xs font-bold uppercase tracking-widest"
              >
                Skip
              </button>
            </div>
          )}

          {/* STEP 2: AI PREFERENCES */}
          {step === 2 && (
            <div className="p-6 md:p-10 flex flex-col max-h-[85vh] md:max-h-[650px]">
              {/* AI Header Section - flex-shrink-0 keeps this from squishing */}
              <div className="flex flex-col items-center text-center mb-6 flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-[32px] flex items-center justify-center mb-4 border-2 border-[#715800]/10 shadow-sm relative">
                  <div className="relative w-20 h-20 md:w-28 md:h-28">
                    <Image
                      src="/images/ai_bot.jpeg"
                      alt="Kivo AI Guide"
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                    Train your Scout
                  </h2>
                  <p className="text-xs md:text-sm text-[#715800] font-bold uppercase tracking-widest bg-[#715800]/5 px-4 py-1.5 rounded-full inline-block mt-2">
                    Kivo AI is Learning
                  </p>
                </div>
              </div>

              <p className="text-gray-500 mb-6 text-sm text-center px-4 flex-shrink-0">
                What are we looking for? Select your vibes so I can find the
                best moves for you.
              </p>

              {/* Scrollable grid - overflow-y-auto is the key fix here */}
              <div className="grid grid-cols-2 gap-3 mb-6 overflow-y-auto pr-2 scrollbar-hide flex-1">
                {INTERESTS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setSelectedInterests((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((i) => i !== item.id)
                          : [...prev, item.id],
                      )
                    }
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 hover:border-[#715800]/40 ${
                      selectedInterests.includes(item.id)
                        ? "border-[#715800] bg-[#715800]/5 text-[#715800] ring-2 ring-[#715800]/10"
                        : "border-gray-100 text-gray-400 bg-gray-50/50"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-bold text-sm tracking-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Button section - flex-shrink-0 ensures this stays visible at the bottom */}
              <div className="pt-2 flex-shrink-0">
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-5 bg-[#715800] text-white font-black rounded-3xl shadow-xl shadow-[#715800]/20 active:scale-95 transition-transform"
                >
                  Personalize my Map
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOGIN */}
          {step === 3 && (
            <div className="p-10 flex flex-col items-center text-center">
              {/* Branded Handshake Icon */}
              <div className="w-24 h-24 bg-[#715800]/5 rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner">
                🤝
              </div>

              <h2 className="text-3xl font-black mb-3 text-gray-900 tracking-tighter">
                Welcome to Kivo
              </h2>

              <p className="text-gray-500 mb-10 text-sm leading-relaxed px-4">
                You're all set! Sign in with Google to save your favorite spots
                and tickets, or start exploring right away as our guest.
              </p>

              <div className="w-full space-y-3">
                {/* Primary Google Sign In */}
                <button
                  onClick={() => {
                    /* Trigger Auth */
                  }}
                  className="w-full py-5 border-2 border-gray-100 rounded-[24px] flex items-center justify-center gap-3 font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  <Image
                    src="/images/google_icon.png"
                    width={20}
                    height={20}
                    alt="G"
                  />
                  <span className="text-gray-700">Continue with Google</span>
                </button>

                {/* Secondary Guest Button */}
                <button
                  onClick={completeOnboarding}
                  className="w-full py-5 bg-gray-900 text-white font-black rounded-[24px] shadow-xl shadow-black/20 hover:bg-black transition-all active:scale-95"
                >
                  Explore as Guest
                </button>
              </div>

              <p className="mt-8 text-[10px] text-gray-400 font-medium px-8">
                By continuing, you agree to Kivo's Terms of Service and Privacy
                Policy.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
