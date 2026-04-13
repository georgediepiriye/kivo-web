"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  ChevronRight,
  CheckCircle,
  Timer,
  Loader2,
} from "lucide-react";

interface CheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any;
}

export default function CheckoutPanel({
  isOpen,
  onClose,
  event,
}: CheckoutPanelProps) {
  const [step, setStep] = useState(1); // 1: Quantity, 2: Info, 3: Success
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!isOpen || step === 3) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReserve = async () => {
    setLoading(true);
    // Simulate API booking call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setStep(3);
  };

  if (!isOpen && step !== 3) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tighter">
                  Reserve a Spot
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">
                  {event.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {step < 3 && (
              <div className="bg-amber-50 px-6 py-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2">
                  <Timer size={14} /> Time left
                </span>
                <span className="font-mono font-bold text-amber-700">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="p-5 rounded-3xl border-2 border-[#715800] bg-[#715800]/5 flex items-center justify-between">
                    <div>
                      <p className="font-black text-gray-900">
                        General Admission
                      </p>
                      <p className="text-xs text-gray-500 font-bold">
                        {event.isFree ? "Free" : `₦${event.price}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center font-black"
                      >
                        -
                      </button>
                      <span className="font-black text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center font-black"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Your Details
                  </p>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-[#715800]/20"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-[#715800]/20"
                      placeholder="Email Address"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter italic">
                    Registration Successful!
                  </h3>
                  <p className="text-gray-500 text-sm font-medium px-8">
                    We&apos;ve sent your ticket details to your email. See you
                    at the event!
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50/50">
              {step < 3 ? (
                <button
                  onClick={() => (step === 1 ? setStep(2) : handleReserve())}
                  disabled={loading}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      {step === 1 ? "Get Tickets" : "Confirm Reservation"}{" "}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-[#715800] text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Back to Event
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
