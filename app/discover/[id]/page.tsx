/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import CheckoutPanel from "@/components/events/CheckoutPanel";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Info,
  Loader2,
  CheckCircle2,
  Users,
  Ticket,
  AlertTriangle,
  ExternalLink,
  X,
  LogIn,
  ShieldCheck,
  RotateCcw,
  Tag,
  Globe,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import EventMap from "@/components/map/EventMap";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // States
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/V1/events/${params.id}`,
        );
        const result = await res.json();

        if (result.status === "success") {
          setEvent(result.data.event);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchEventDetails();
  }, [params.id]);

  const timeStatus = useMemo(() => {
    if (!event) return null;
    const now = new Date().getTime();
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();

    if (now < start) return "upcoming";
    if (now <= end) return "ongoing";
    return "past";
  }, [event]);

  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (event.isFree) return "Free";

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const minPrice = Math.min(...event.ticketTiers.map((t: any) => t.price));
      return `From ₦${minPrice.toLocaleString()}`;
    }

    return event.externalTicketLink ? "Paid" : "Paid Entry";
  }, [event]);

  const handleCTA = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (event?.allowAnonymous === false && !token) {
      setIsAuthModalOpen(true);
      return;
    }

    if (event?.externalTicketLink) {
      setIsExternalModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const confirmExternalRedirect = () => {
    if (event?.externalTicketLink) {
      window.open(event.externalTicketLink, "_blank");
      setIsExternalModalOpen(false);
    }
  };

  const handleReport = () => {
    alert(
      "Thank you for your report. Our team will review this event shortly.",
    );
  };

  const handleOpenMap = () => {
    if (event?.location?.coordinates) {
      const [lng, lat] = event.location.coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#715800]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!event)
    return (
      <div className="p-20 text-center font-bold text-gray-400">
        Event not found.
      </div>
    );

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }) +
      " • " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const formattedDate = getFormattedDate(event.startDate);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Navbar />

      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-[#715800]/10 rounded-3xl flex items-center justify-center text-[#715800] mb-6">
                <LogIn size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                Sign in Required
              </h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                The host of this event requires guests to have a verified Kivo
                account to reserve a spot.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() =>
                    router.push(`/auth/signin?redirect=/discover/${event.id}`)
                  }
                  className="w-full py-4 bg-black text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Sign In to Kivo
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="w-full py-4 bg-white text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* External Link Warning Modal */}
      <AnimatePresence>
        {isExternalModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExternalModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsExternalModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                Leaving Kivo
              </h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                You are being redirected to an external site to complete your
                booking. Please review their terms and safety policies.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmExternalRedirect}
                  className="w-full py-4 bg-black text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Continue to Site
                </button>
                <button
                  onClick={() => setIsExternalModalOpen(false)}
                  className="w-full py-4 bg-white text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-20 pb-32 md:pt-28 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Back to City
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleReport}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-red-50 text-red-400 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest"
              >
                <AlertTriangle size={16} /> Report
              </button>
              <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#715800] transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src={
                    event.image || "https://picsum.photos/seed/kivo/1200/800"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-gray-900">
                    {event.category}
                  </span>
                  <span
                    className={`px-5 py-2.5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 ${timeStatus === "ongoing" ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-white ${timeStatus === "ongoing" ? "animate-pulse" : ""}`}
                    />{" "}
                    {timeStatus}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <Image
                      src={
                        event.organizer?.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer?.name}`
                      }
                      alt="Org"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#715800]">
                      Posted By
                    </p>
                    <h4 className="text-xl font-black text-gray-900">
                      {event.organizer?.name || "Kivo Host"}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? "bg-gray-200 text-gray-600" : "bg-[#715800] text-white active:scale-95"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#715800]/5 flex items-center justify-center text-[#715800]">
                      <Calendar size={20} />
                    </div>
                    <div className="font-bold text-gray-900">
                      <p className="text-[10px] font-black uppercase text-gray-400">
                        Date & Time
                      </p>
                      {formattedDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <MapPin size={20} />
                    </div>
                    <div className="font-bold text-gray-900">
                      <p className="text-[10px] font-black uppercase text-gray-400">
                        Location
                      </p>
                      {event.location?.neighborhood}, Port Harcourt
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-[#715800]" /> Overview
                </h3>
                <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Ticket Tiers Section */}
              {event.ticketTiers && event.ticketTiers.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                    <Ticket size={20} className="text-[#715800]" /> Ticket Types
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.ticketTiers.map((tier: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 rounded-[24px] border border-gray-100 bg-white hover:border-black/10 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                            {tier.name}
                          </h4>
                          <span className="text-[#715800] font-black">
                            ₦{tier.price.toLocaleString()}
                          </span>
                        </div>
                        {tier.description && (
                          <p className="text-xs text-gray-500 font-medium">
                            {tier.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Rules & Policy
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <ShieldCheck size={18} className="text-green-600" /> Age:{" "}
                      {event.ageRestriction}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <RotateCcw size={18} className="text-amber-600" /> Refund:{" "}
                      {event.refundPolicy} Policy
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-500 flex items-center gap-1"
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block sticky top-28 p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Entry
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {displayPrice}
                  </p>
                </div>
                <button
                  onClick={handleCTA}
                  disabled={event.isCancelled}
                  className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${hasReserved ? "bg-green-50 text-green-600 pointer-events-none" : event.isCancelled ? "bg-gray-100 text-gray-400" : "bg-gray-900 text-white hover:bg-black active:scale-95"}`}
                >
                  {event.isCancelled ? (
                    "Cancelled"
                  ) : hasReserved ? (
                    <>
                      <CheckCircle2 size={18} /> Reserved
                    </>
                  ) : event.externalTicketLink ? (
                    <>
                      <ExternalLink size={18} /> Get Tickets
                    </>
                  ) : (
                    "Reserve a spot"
                  )}
                </button>
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center justify-between">
                    Venue Location{" "}
                    <span
                      onClick={handleOpenMap}
                      className="text-[#715800] cursor-pointer hover:underline"
                    >
                      View Map
                    </span>
                  </p>
                  <div className="h-48 rounded-[24px] overflow-hidden bg-gray-100 border border-gray-100">
                    <EventMap
                      latitude={event.location.coordinates[1]}
                      longitude={event.location.coordinates[0]}
                    />
                  </div>
                  <p className="mt-4 text-xs font-bold text-gray-600 flex items-start gap-2">
                    <MapPin size={14} className="shrink-0 text-[#715800]" />
                    {event.location?.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isCheckoutOpen && !isAuthModalOpen && !isExternalModalOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100]">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <div className="flex-1">
              <p className="text-lg font-black text-gray-900">{displayPrice}</p>
            </div>
            <button
              onClick={handleCTA}
              disabled={hasReserved || event.isCancelled}
              className="flex-[2] py-4 bg-gray-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
            >
              {event.isCancelled
                ? "Cancelled"
                : hasReserved
                  ? "Joined"
                  : "Reserve spot"}
            </button>
          </div>
        </div>
      )}

      <MobileNav />
      <Footer />
    </div>
  );
}
