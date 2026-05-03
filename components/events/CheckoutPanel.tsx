/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ChevronRight, Timer, Loader2, UserCheck } from "lucide-react";
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  // User Auth State
  const [user, setUser] = useState<any>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  /**
   * Fetches user data to enable "Use my details"
   */
  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
      }
    } catch (error) {
      console.error("Checkout: User fetch failed", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUser();
      setTimeLeft(900); // Reset timer whenever panel opens
    }
  }, [isOpen, fetchUser]);

  /**
   * Auto-fills the form using profile data
   */
  const handleUseMyDetails = () => {
    if (!user) {
      toast.error("Could not find profile details");
      return;
    }

    const names = user.name ? user.name.split(" ") : ["", ""];
    setFirstName(names[0] || "");
    setLastName(names.slice(1).join(" ") || "");
    setEmail(user.email || "");

    toast.success("Details filled from profile");
  };

  // Set default tier if none selected
  useEffect(() => {
    if (event?.ticketTiers?.length > 0 && !selectedTier) {
      setSelectedTier(event.ticketTiers[0]);
    }
  }, [event, selectedTier]);

  /**
   * Timer logic with auto-close on expiry
   */
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Booking session expired. Please try again.", {
            id: "checkout-timeout",
          });
          resetAndClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Field validation and Step management
   */
  const validateAndProceed = () => {
    if (step === 1) {
      if (!selectedTier) {
        toast.error("Please select a ticket tier.");
        return;
      }
      setStep(2);
    } else {
      // Step 2 Validation
      if (!firstName.trim()) return toast.error("First name is required");
      if (!lastName.trim()) return toast.error("Last name is required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        return toast.error("Please enter a valid email address");
      }

      handleProcessOrder();
    }
  };

  /**
   * API call to create order and redirect to payment
   */
  const handleProcessOrder = async () => {
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

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server communication error. Please try again.");
      }

      const result = await response.json();

      if (response.ok && result.status === "success") {
        if (result.data.isFree) {
          toast.success("Spot secured! Check your email.");
          router.push(`/booking-success?ref=${result.data.reference}`);
        } else {
          toast.success("Redirecting to Paystack...");
          window.location.href = result.data.authorization_url;
        }
      } else {
        throw new Error(
          result.message || "Booking failed. Ticket might be sold out.",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setLoading(false);
      setFirstName("");
      setLastName("");
      setEmail("");
    }, 500);
  };

  if (!isOpen) return null;

  const total = quantity * (selectedTier?.price || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timer Banner */}
            <div className="bg-amber-50 px-6 py-2.5 flex items-center justify-between border-b border-amber-100">
              <span className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2">
                <Timer size={14} className="animate-pulse" /> Inventory Reserved
              </span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Select Ticket Tier
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
                                  {tier.capacity - (tier.sold || 0)} available
                                </p>
                              </div>
                              <p className="font-black">
                                {tier.price === 0
                                  ? "FREE"
                                  : `₦${tier.price.toLocaleString()}`}
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
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span className="font-black text-2xl w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(Math.min(10, quantity + 1))
                          }
                          className="w-12 h-12 rounded-xl bg-white shadow-sm font-black text-xl active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Contact Information
                        </p>
                        {user && (
                          <button
                            onClick={handleUseMyDetails}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#715800] hover:underline"
                          >
                            <UserCheck size={14} /> Use Profile
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="First Name"
                          />
                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="Last Name"
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
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-[16px] font-bold outline-none"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Summary Card */}
                    <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase">
                          Order Summary
                        </p>
                        <p className="font-black text-sm uppercase">
                          {selectedTier?.name} x {quantity}
                        </p>
                      </div>
                      <p className="font-black text-xl">
                        {total === 0 ? "FREE" : `₦${total.toLocaleString()}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
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
                      ? "Continue to details"
                      : total === 0
                        ? "Confirm Free Booking"
                        : `Pay ₦${total.toLocaleString()}`}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              {step === 2 && !loading && (
                <button
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-[10px] font-black text-gray-400 uppercase hover:text-black transition-colors"
                >
                  Change Selection
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
