/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  ChevronRight,
  Timer,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface CheckoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export default function CheckoutPanel({
  isOpen,
  onClose,
  event,
}: CheckoutPanelProps) {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (event?.ticketTiers?.length > 0 && !selectedTier) {
      setSelectedTier(event.ticketTiers[0]);
    }
  }, [event, selectedTier]);

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

  // VALIDATION LOGIC
  const validateAndProceed = () => {
    if (step === 1) {
      if (!selectedTier) {
        toast.error("Please select a ticket tier.");
        return;
      }
      setStep(2);
    } else {
      handleProcessOrder();
    }
  };

  const handleProcessOrder = async () => {
    // Check required fields before submission
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in all attendee details.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/book`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event._id,
            tierName: selectedTier.name,
            quantity,
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success("Spot secured! Redirecting...");
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error(result.message || "Failed to initialize booking");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  const total = quantity * (selectedTier?.price || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ x: "100%" }} // Completely off-screen
            animate={{ x: 0 }}
            exit={{ x: "110%" }} // Pushed slightly further on exit to ensure it's off mobile view
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase italic">
                  Checkout
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[200px]">
                  {event.title}
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timer */}
            <div className="bg-amber-50 px-6 py-2.5 flex items-center justify-between border-b border-amber-100">
              <span className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2">
                <Timer size={14} className="animate-pulse" /> Inventory Reserved
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Select Tier
                      </p>
                      <div className="space-y-3">
                        {event.ticketTiers?.map((tier: any) => (
                          <button
                            key={tier._id}
                            onClick={() => setSelectedTier(tier)}
                            className={`w-full p-5 rounded-[24px] border-2 text-left transition-all ${
                              selectedTier?.name === tier.name
                                ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                : "border-gray-100 bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-black text-sm uppercase">
                                  {tier.name}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  {tier.capacity - (tier.sold || 0)} left
                                </p>
                              </div>
                              <p className="font-black">
                                ₦{tier.price.toLocaleString()}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Quantity
                      </p>
                      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-[24px] justify-center">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl"
                        >
                          -
                        </button>
                        <span className="font-black text-2xl">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Personal Details
                      </p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            // Changed text-sm to text-[16px] to prevent mobile zoom
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="First Name"
                            required
                          />
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            // Changed text-sm to text-[16px] to prevent mobile zoom
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="Last Name"
                            required
                          />
                        </div>
                        <div className="relative">
                          <Mail
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            // Changed text-sm to text-[16px] to prevent mobile zoom
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="Email Address"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">
                          Selected
                        </p>
                        <p className="font-black text-sm uppercase">
                          {selectedTier?.name} x {quantity}
                        </p>
                      </div>
                      <p className="font-black text-xl">
                        ₦{total.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-white">
              <button
                onClick={validateAndProceed}
                disabled={loading}
                className="w-full py-5 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-gray-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {step === 1
                      ? "Next Step"
                      : `Pay ₦${total.toLocaleString()}`}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              {step === 2 && !loading && (
                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-[10px] font-black text-gray-400 uppercase hover:text-black"
                >
                  Go Back
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
