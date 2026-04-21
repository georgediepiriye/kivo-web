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
  Ticket,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Tag,
  Globe,
  Monitor,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import EventMap from "@/components/map/EventMap";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${params.id}`,
        );
        const result = await res.json();

        if (result.status === "success") {
          const data = result.data.event;
          // Normalize online status logic
          data.isOnline = data.medium === "online" || data.isOnline === true;
          setEvent(data);
        }
      } catch (error) {
        console.error("Kivo Detail Fetch Error:", error);
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

  // PROFESSIONAL PRICE LABEL LOGIC
  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (event.ticketingType === "none" || event.isFree) return "Free";

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const prices = event.ticketTiers.map((t: any) => t.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === 0 && max > 0) return "Free +";
      if (min === 0 && max === 0) return "Free";
      if (min === max) return `₦${min.toLocaleString()}`;
      return `From ₦${min.toLocaleString()}`;
    }

    return event.externalTicketLink || event.joinLink ? "Paid" : "Invite Only";
  }, [event]);

  // SMART BUTTON TEXT LOGIC
  // SMART BUTTON TEXT LOGIC
  const getButtonContent = () => {
    if (event.isCancelled) return "Event Cancelled";
    if (hasReserved) return "Spot Reserved";
    if (event.externalTicketLink) return "Get External Tickets";
    if (event.isOnline) return "Join Event Online";

    // NEW LOGIC: Check if any tier actually costs money
    const hasPaidTiers = event.ticketTiers?.some((tier: any) => tier.price > 0);

    if (event.isFree || (event.ticketingType === "none" && !hasPaidTiers)) {
      return "Register for Free";
    }

    if (hasPaidTiers) {
      return "Get Tickets"; // Or "Reserve a Spot"
    }

    return "Register for Free";
  };

  const handleCTA = () => {
    if (event.isCancelled) return;

    if (event.externalTicketLink) {
      window.open(event.externalTicketLink, "_blank");
      return;
    }

    if (event.joinLink && event.isOnline) {
      window.open(event.joinLink, "_blank");
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handleOpenMap = () => {
    if (event?.location?.coordinates) {
      const [lng, lat] = event.location.coordinates;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#715800]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Syncing Details...
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

  const formattedDate =
    new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) +
    " • " +
    new Date(event.startDate).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Navbar />
      <CheckoutPanel
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />

      <main className="flex-1 pt-20 pb-32 md:pt-28 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Back to City
            </button>
            <div className="flex gap-2">
              <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#715800] transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
              {/* Main Visual */}
              <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src={
                    event.image || "https://picsum.photos/seed/kivo/1200/800"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  // Optimized sizes for performance
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-gray-900 shadow-sm">
                    {event.category}
                  </span>
                  <span
                    className={`px-5 py-2.5 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 text-white ${
                      timeStatus === "ongoing"
                        ? "bg-green-500/90"
                        : "bg-gray-900/80"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-white ${
                        timeStatus === "ongoing" ? "animate-pulse" : ""
                      }`}
                    />
                    {timeStatus}
                  </span>
                </div>
              </div>

              {/* Header Info */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-gray-900 leading-[0.85] uppercase italic">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-6 py-8 border-y border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#715800] border border-gray-100">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        When
                      </p>
                      <p className="font-black text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#715800] border border-gray-100">
                      {event.isOnline ? (
                        <Globe size={24} />
                      ) : (
                        <MapPin size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Where
                      </p>
                      <p className="font-black text-gray-900">
                        {event.isOnline
                          ? "Virtual / Online"
                          : event.location?.address +
                              "," +
                              " " +
                              event.location?.neighborhood ||
                            "Location details upon registration"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                  <Info size={20} className="text-[#715800]" /> Overview
                </h3>
                <div className="relative">
                  <p
                    className={`text-gray-600 leading-relaxed font-medium whitespace-pre-wrap transition-all duration-500 ${!showFullDescription ? "max-h-[200px] overflow-hidden" : "max-h-full"}`}
                  >
                    {event.description}
                  </p>
                  {!showFullDescription && event.description?.length > 350 && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FDFDFD] via-[#FDFDFD]/80 to-transparent pointer-events-none" />
                  )}
                </div>
                {event.description?.length > 350 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#715800] hover:scale-105 transition-transform"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp size={14} /> Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Expand Description
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Ticket Tiers Section */}
              {event.ticketingType === "internal" &&
                event.ticketTiers?.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                      <Ticket size={20} className="text-[#715800]" /> Ticket
                      Tiers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.ticketTiers.map((tier: any) => (
                        <div
                          key={tier._id}
                          className="p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:border-[#715800]/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">
                              {tier.name}
                            </h4>
                            <span className="text-lg font-black text-[#715800]">
                              {tier.price === 0
                                ? "FREE"
                                : `₦${tier.price.toLocaleString()}`}
                            </span>
                          </div>
                          {tier.description && (
                            <p className="text-xs text-gray-400 mb-4 font-medium line-clamp-2">
                              {tier.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 mb-2">
                            <span>Availability</span>
                            <span>
                              {Math.max(0, tier.capacity - (tier.sold || 0))}{" "}
                              Left
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 transition-all"
                              style={{
                                width: `${Math.min(100, ((tier.sold || 0) / tier.capacity) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Sidebar Sticky Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block sticky top-28 p-8 bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Pricing
                    </p>
                    <p className="text-3xl font-black text-gray-900 uppercase italic">
                      {displayPrice}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                    <Users size={20} />
                  </div>
                </div>

                <button
                  onClick={handleCTA}
                  disabled={event.isCancelled || hasReserved}
                  className={`w-full py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg ${event.isCancelled ? "bg-red-50 text-red-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-black/20"}`}
                >
                  {getButtonContent()}
                </button>

                <div className="pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Venue Map
                    </p>
                    {!event.isOnline && (
                      <button
                        onClick={handleOpenMap}
                        className="text-[10px] font-black uppercase text-[#715800] hover:underline"
                      >
                        Get Directions
                      </button>
                    )}
                  </div>

                  {!event.isOnline ? (
                    <div className="space-y-4">
                      <div className="h-56 rounded-[32px] overflow-hidden bg-gray-100 border border-gray-100">
                        <EventMap
                          latitude={event.location?.coordinates?.[1]}
                          longitude={event.location?.coordinates?.[0]}
                        />
                      </div>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed px-2 italic">
                        {event.location?.address +
                          "," +
                          " " +
                          event.location?.neighborhood ||
                          "Location details provided upon registration."}
                      </p>
                    </div>
                  ) : (
                    <div className="h-56 rounded-[32px] bg-blue-50 flex flex-col items-center justify-center text-center p-8 border border-blue-100">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm mb-4">
                        <Monitor size={32} />
                      </div>
                      <p className="text-xs font-black uppercase text-blue-600 tracking-widest">
                        Virtual Move
                      </p>
                      <p className="text-[10px] font-bold text-blue-400 mt-2">
                        Access link will be visible in your profile after
                        registration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Action */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <button
          onClick={handleCTA}
          className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          {getButtonContent()} — {displayPrice}
        </button>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}
