"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Share2,
  Info,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import EventMap from "@/components/map/EventMap";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGoing, setIsGoing] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#715800]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Loading Move...
          </p>
        </div>
      </div>
    );
  }

  if (!event) return <div className="p-20 text-center">Event not found.</div>;

  const formattedDate = new Date(event.startDate).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-24 md:pt-28">
        <div className="max-w-6xl mx-auto px-6">
          {/* NAVIGATION & ACTIONS */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to City
            </button>
            <div className="flex gap-2">
              <button className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#715800] transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* LEFT COLUMN: VISUALS & INFO */}
            <div className="lg:col-span-8 space-y-10">
              {/* HERO IMAGE */}
              <div className="relative aspect-[16/9] w-full rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100">
                <Image
                  src={
                    // event.image ||
                    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=60"
                  }
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-xl">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9]">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#715800]/5 flex items-center justify-center text-[#715800]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Date & Time
                      </p>
                      <p className="font-bold text-gray-900">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Location
                      </p>
                      <p className="font-bold text-gray-900">
                        {event.location?.neighborhood}, PH
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-gray max-w-none">
                  <h3 className="text-xl font-black tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                    <Info size={20} className="text-[#715800]" />
                    About this Move
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: BOOKING & MAP */}
            <div className="lg:col-span-4 space-y-6">
              {/* STICKY ACTION CARD */}
              <div className="sticky top-28 p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-black/5 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Entry
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {event.isFree
                        ? "Free"
                        : `₦${event.price?.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Host
                    </p>
                    <p className="font-bold text-gray-900">
                      {event.organizer?.name || "Kivo Host"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsGoing(!isGoing)}
                    className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                      isGoing
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-xl shadow-black/10"
                    }`}
                  >
                    {isGoing ? (
                      <>
                        <CheckCircle2 size={18} /> You&apos;re In!
                      </>
                    ) : (
                      "Join the Move"
                    )}
                  </button>
                  <a
                    href={`https://wa.me/2340000000000?text=I'm interested in ${event.title}`}
                    className="w-full py-5 rounded-[24px] bg-white border border-gray-100 text-gray-900 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <MessageCircle size={18} />
                    Inquire on WhatsApp
                  </a>
                </div>

                {/* MINI MAP SECTION */}
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
                    Venue Location
                    <span className="text-[#715800]">View Map</span>
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

      <MobileNav />
      <Footer />
    </div>
  );
}
