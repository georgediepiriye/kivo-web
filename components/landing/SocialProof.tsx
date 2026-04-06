"use client";
import React from "react";

export default function SocialProof() {
  const spots = [
    "HARD ROCK · LAGOS",
    "THE NEST · ABUJA",
    "SHIRO · LAGOS",
    "PIAZZA · PH",
    "CENTRAL PARK · ABUJA",
  ];

  return (
    <section className="bg-surface-container-low py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <p className="text-center text-on-surface-variant font-label text-sm uppercase tracking-[0.2em] mb-10 font-semibold">
          Vibing at the nation&apos;s top spots
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {spots.map((spot, i) => (
            <div
              key={i}
              className="text-2xl font-black font-headline text-on-surface tracking-tighter"
            >
              {spot}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
