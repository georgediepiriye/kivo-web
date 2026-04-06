"use client";

import { useState } from "react";
import EventCard from "@/components/cards/EventCard";
import MobileNav from "@/components/layout/MobileNav";
import Navbar from "@/components/layout/NavBar";
import { EVENT_CATEGORIES } from "@/lib/categories";
import type { Props as EventCardProps } from "@/components/cards/EventCard";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    keyof typeof EVENT_CATEGORIES | "all"
  >("all");

  // ✅ ADDED: distance state
  const [maxDistance, setMaxDistance] = useState(10);

  const events: (EventCardProps & { id: string })[] = [
    {
      id: "jollof-chill",
      title: "Jollof & Chill",
      image:
        "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=800&auto=format&fit=crop&q=60",
      category: "social",
      time: "Starts 2 PM",
      location: "Central Park, Lagos",
      distance: "3 km",
      buttonText: "Join Event",
    },
    {
      id: "football-5aside",
      title: "5-a-side Football",
      image:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=60",
      category: "sports",
      time: "4 PM",
      location: "No 1 Field, Port Harcourt",
      distance: "5 km",
      buttonText: "View Details",
    },
    {
      id: "sunrise-yoga",
      title: "Sunrise Yoga",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60",
      category: "wellness",
      time: "7 AM",
      location: "Skyline Terrace, Abuja",
      distance: "2 km",
      buttonText: "View Details",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchCategory =
      activeCategory === "all" || event.category === activeCategory;

    const matchSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    // ✅ ADDED: distance filtering logic
    const eventDistance = parseFloat(event.distance || "0");
    const matchDistance = eventDistance <= maxDistance;

    return matchCategory && matchSearch && matchDistance;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-28 px-4 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">Discover Events</h1>

        {/* 🔎 SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-200 outline-none"
        />

        {/* ✅ ADDED: DISTANCE FILTER */}
        <div className="mb-4">
          <label className="text-sm font-medium">
            Distance: {maxDistance} km
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full ${
              activeCategory === "all" ? "bg-blue-200" : "bg-gray-100"
            }`}
          >
            All
          </button>

          {Object.entries(EVENT_CATEGORIES).map(([key, value]) => (
            <button
              key={key}
              onClick={() =>
                setActiveCategory(key as keyof typeof EVENT_CATEGORIES)
              }
              className={`px-4 py-2 rounded-full ${
                activeCategory === key ? value.color : "bg-gray-100"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>

        {/* EVENTS */}
        <div className="space-y-6 mb-28">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/feed/${event.id}`)}
              className="cursor-pointer"
            >
              <EventCard {...event} />
            </div>
          ))}
        </div>
      </main>

      <MobileNav />
      <Footer />
    </div>
  );
}
