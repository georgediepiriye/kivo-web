"use client";

import Image from "next/image";
import { useState } from "react";
import { WhatsappLogo, ArrowLeft } from "phosphor-react";
import EventMap from "@/components/map/EventMap";
import Navbar from "@/components/layout/NavBar";
import { useRouter } from "next/navigation";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";

interface EventDetailsProps {
  title: string;
  image: string;
  category: string;
  time: string;
  location: string;
  distance: string;
  description: string;
  host: string;
  attendees?: string[];
  latitude?: number;
  longitude?: number;
  whatsappLink?: string;
}

export default function EventDetailsPage({
  title = "Jollof & Chill",
  image = "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=800&auto=format&fit=crop&q=60",
  category = "social",
  time = "Starts 2 PM",
  location = "Central Park, Lagos",
  distance = "3 km",
  description = "Join us for a fun afternoon of jollof, music, and socializing in Lagos!",
  host = "Jane Doe",
  attendees = [],
  latitude = 6.5244,
  longitude = 3.3792,
  whatsappLink = "https://wa.me/2348012345678",
}: EventDetailsProps) {
  const [going, setGoing] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAVBAR ABOVE HEADER */}
      <Navbar />

      {/* HEADER */}
      <div className="relative w-full h-80 md:h-[450px] mt-16 md:mt-20">
        <Image src={image} alt={title} fill className="object-cover" priority />

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/40 text-white px-4 py-2 rounded-full backdrop-blur hover:bg-black/60 transition"
        >
          <ArrowLeft size={18} weight="bold" />
          Back
        </button>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-10">
          <div>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur">
              {category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-3">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* LEFT */}
        <div className="md:col-span-2 space-y-8">
          {/* EVENT INFO CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>🕒 {time}</span>
              <span>📍 {distance}</span>
            </div>

            <div className="text-lg font-semibold">{location}</div>

            <div className="text-sm text-gray-600">
              Hosted by <span className="font-medium">{host}</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* ATTENDEES */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">People going</h2>

            {attendees.length === 0 ? (
              <p className="text-gray-500 text-sm">Be the first to join 🎉</p>
            ) : (
              <div className="flex -space-x-3">
                {attendees.map((a, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center border-2 border-white text-sm"
                  >
                    {a[0]}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setGoing(!going)}
              className={`px-6 py-3 rounded-full font-medium transition ${
                going
                  ? "bg-black text-white"
                  : "bg-black text-white hover:opacity-80"
              }`}
            >
              {going ? "Going ✅" : "Join Event"}
            </button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-green-500 text-white flex items-center gap-2 hover:bg-green-600 transition"
            >
              <WhatsappLogo size={18} weight="fill" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-80 md:h-full">
            <EventMap latitude={latitude!} longitude={longitude!} />
          </div>
        </div>
      </div>
      <MobileNav />
      <Footer />
    </div>
  );
}
