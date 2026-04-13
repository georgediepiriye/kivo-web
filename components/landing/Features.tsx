"use client";
import React from "react";
import Image from "next/image";
import { MapPin, Sparkles, PlusCircle } from "lucide-react";

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-32">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
          Everything you need to find things to do
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Explore what’s happening nearby, get relevant recommendations, and
          create your own events — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Large Feature Card */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-10 flex flex-col justify-between min-h-[400px] editorial-shadow group">
          <div className="max-w-md">
            <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center text-on-primary-container mb-6 group-hover:scale-110 transition-transform">
              <MapPin size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black font-headline mb-4">
              See what’s happening nearby
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              A real-time map of events and activities around you. Quickly find
              where to go without endless searching.
            </p>
          </div>
          <div className="mt-8 overflow-hidden rounded-xl h-48 bg-surface-container relative">
            <Image
              src="/images/nearby.png"
              alt="Map showing nearby events"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Small Feature Card 1 */}
        <div className="md:col-span-4 bg-secondary-container rounded-2xl p-10 flex flex-col justify-between editorial-shadow border-b-8 border-secondary group">
          <div>
            <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:rotate-12 transition-transform">
              <Sparkles size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black font-headline mb-4 text-on-secondary-container">
              Personalized recommendations
            </h3>
            <p className="text-on-secondary-container opacity-80 leading-relaxed">
              Get suggestions based on your interests and activity — so you
              always find something relevant.
            </p>
          </div>
        </div>

        {/* Small Feature Card 2 */}
        <div className="md:col-span-4 bg-primary-container rounded-2xl p-10 flex flex-col justify-between editorial-shadow border-b-8 border-primary group">
          <div>
            <div className="w-14 h-14 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:-translate-y-2 transition-transform">
              <PlusCircle size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black font-headline mb-4 text-on-primary-container">
              Create and share activities
            </h3>
            <p className="text-on-primary-container opacity-80 leading-relaxed">
              Hosting something? Create it in seconds and let people nearby
              discover and join.
            </p>
          </div>
        </div>

        {/* Medium Feature Card */}
        <div className="md:col-span-8 bg-surface-container-highest rounded-2xl p-10 flex flex-col md:flex-row items-center gap-8 editorial-shadow overflow-hidden relative">
          <div className="flex-1 z-10">
            <h3 className="text-3xl font-black font-headline mb-4">
              Stay connected in real time
            </h3>
            <p className="text-on-surface-variant leading-relaxed">
              See what your friends are attending and join instantly. No more
              back-and-forth planning.
            </p>
          </div>
          <div className="flex-1 h-full min-h-[200px] relative">
            <Image
              src="/images/friends_connecting.png"
              alt="Friends discovering events together"
              fill
              className="object-cover rounded-xl shadow-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
