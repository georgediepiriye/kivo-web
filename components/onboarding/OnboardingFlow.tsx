/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

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
                  alt="Location Illustration"
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

          {/* STEP 2: LOGIN (Formerly Step 3) */}
          {step === 2 && (
            <div className="p-10 flex flex-col items-center text-center">
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
                <button
                  onClick={() => {
                    /* Trigger Auth Logic */
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
