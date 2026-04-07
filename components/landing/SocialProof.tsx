"use client";
import React from "react";

export default function SocialProof() {
  const spots = [
    "PIAZZA · GRA", // High-end / Dining
    "BOLE KING · D-LINE", // Cultural / Foodie
    "PLEASURE PARK · PH", // Family / Outdoor / Activities
    "UNIPORT · CHOBA", // Student / Youth Hub
    "CASABLANCA · GRA", // Nightlife / Iconic
    "SPAR · MALL", // Casual / Shopping / Hangout
    "BORIKIRI · TOWN", // The "Area" / Local Vibe
    "GENESIS · GRA", // Cinema / Entertainment
  ];

  return (
    <section className="bg-[#f5f6f7] py-16 overflow-hidden border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-slate-500 font-bold text-xs uppercase tracking-[0.25em] mb-12">
          From GRA to the Heart of the Garden City
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
          {spots.map((spot, i) => (
            <div
              key={i}
              className="text-lg md:text-2xl font-black text-[#1e293b] tracking-tighter hover:text-[#715800] transition-colors"
            >
              {spot}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
