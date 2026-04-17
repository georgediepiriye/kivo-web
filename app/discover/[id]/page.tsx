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
  Ticket,
  AlertTriangle,
  ExternalLink,
  X,
  LogIn,
  ShieldCheck,
  RotateCcw,
  Tag,
  Globe,
  Link as LinkIcon,
  Monitor,
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
          const data = result.data.event;
          // Normalize online status
          data.isOnline = data.medium === "online" || data.isOnline === true;
          setEvent(data);
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

  const canReserve = useMemo(() => {
    if (!event || event.isCancelled) return false;
    if (event.externalTicketLink || event.joinLink) return true;
    if (event.isFree) return true;
    return event.ticketTiers && event.ticketTiers.length > 0;
  }, [event]);

  const displayPrice = useMemo(() => {
    if (!event) return "";
    if (event.isFree) return "Free";
    if (event.ticketTiers && event.ticketTiers.length > 0) {
      const minPrice = Math.min(...event.ticketTiers.map((t: any) => t.price));
      return `From ₦${minPrice.toLocaleString()}`;
    }
    return event.externalTicketLink || event.joinLink ? "Paid" : "Invite Only";
  }, [event]);

  const handleCTA = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (event?.allowAnonymous === false && !token) {
      setIsAuthModalOpen(true);
      return;
    }
    if (event?.externalTicketLink || event?.joinLink) {
      setIsExternalModalOpen(true);
    } else if (canReserve) {
      setIsCheckoutOpen(true);
    }
  };

  const confirmExternalRedirect = () => {
    const target = event?.externalTicketLink || event?.joinLink;
    if (target) {
      window.open(target, "_blank");
      setIsExternalModalOpen(false);
    }
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

      {/* Modals remain the same logic... */}

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
              <button
                onClick={() => alert("Report submitted.")}
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
                  priority
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
                  {/* ONLINE BADGE ON IMAGE */}
                  {event.isOnline && (
                    <span className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Globe size={14} className="animate-spin-slow" /> Online
                    </span>
                  )}
                </div>
              </div>

              {(event.joinLink || event.externalTicketLink) && (
                <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      {event.isOnline ? (
                        <Globe size={20} />
                      ) : (
                        <LinkIcon size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-blue-600">
                        {event.isOnline ? "Meeting Link" : "Event Link"}
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
                        {event.joinLink || event.externalTicketLink}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        event.joinLink || event.externalTicketLink,
                        "_blank",
                      )
                    }
                    className="p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <ExternalLink size={18} />
                  </button>
                </div>
              )}

              <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      event.organizer?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer?.name}`
                    }
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-white shadow-sm"
                    alt=""
                  />
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
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.isOnline ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-900"}`}
                    >
                      {event.isOnline ? (
                        <Globe size={20} />
                      ) : (
                        <MapPin size={20} />
                      )}
                    </div>
                    <div className="font-bold text-gray-900">
                      <p className="text-[10px] font-black uppercase text-gray-400">
                        Location
                      </p>
                      {event.isOnline
                        ? "Online Move (Worldwide)"
                        : `${event.location?.neighborhood}, Port Harcourt`}
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

              {/* Ticket Section logic remains... */}

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
                    Medium & Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${event.isOnline ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {event.isOnline ? (
                        <Monitor size={10} />
                      ) : (
                        <MapPin size={10} />
                      )}{" "}
                      {event.isOnline ? "Online" : "Physical"}
                    </span>
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
                  disabled={!canReserve || hasReserved}
                  className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${!canReserve ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black active:scale-95"}`}
                >
                  {event.isCancelled
                    ? "Cancelled"
                    : hasReserved
                      ? "Reserved"
                      : event.isOnline
                        ? "Join Online Move"
                        : "Reserve a spot"}
                </button>

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center justify-between">
                    {event.isOnline ? "Online Medium" : "Venue Location"}
                    {!event.isOnline && (
                      <span
                        onClick={handleOpenMap}
                        className="text-[#715800] cursor-pointer hover:underline"
                      >
                        View Map
                      </span>
                    )}
                  </p>

                  {event.isOnline ? (
                    <div className="h-48 rounded-[24px] bg-blue-50 flex flex-col items-center justify-center text-center p-6 border border-blue-100">
                      <Globe
                        size={40}
                        className="text-blue-600 mb-4 animate-pulse"
                      />
                      <p className="text-xs font-black uppercase text-blue-600">
                        This move is virtual
                      </p>
                      <p className="text-[10px] text-blue-400 font-bold mt-1">
                        Join from anywhere in the world
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-48 rounded-[24px] overflow-hidden bg-gray-100 border border-gray-100">
                        <EventMap
                          latitude={event.location.coordinates[1]}
                          longitude={event.location.coordinates[0]}
                        />
                      </div>
                      <p className="mt-4 text-xs font-bold text-gray-600 flex items-start gap-2">
                        <MapPin size={14} className="shrink-0 text-[#715800]" />{" "}
                        {event.location?.address}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {!isCheckoutOpen && !isAuthModalOpen && !isExternalModalOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100]">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <div className="flex-1 text-lg font-black text-gray-900">
              {displayPrice}
            </div>
            <button
              onClick={handleCTA}
              disabled={!canReserve || hasReserved}
              className="flex-[2] py-4 bg-gray-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              {event.isCancelled
                ? "Cancelled"
                : hasReserved
                  ? "Joined"
                  : event.isOnline
                    ? "Join Online"
                    : "Reserve Spot"}
            </button>
          </div>
        </div>
      )}
      <MobileNav />
      <Footer />
    </div>
  );
}
