/* eslint-disable @typescript-eslint/no-explicit-any */
import { EVENT_CATEGORIES } from "@/lib/categories";
import Image from "next/image";
import { Clock, MapPin, ChevronRight, Globe } from "lucide-react";

export type Props = {
  title: string;
  image: string;
  category: keyof typeof EVENT_CATEGORIES;
  time: string;
  location: string;
  distance?: string;
  buttonText: string;
  badge?: string;
  attendees?: number;
  participantImages?: string[];
  timeStatus?: "upcoming" | "ongoing" | "past";
  isOnline?: boolean; // New Prop
  className?: string;
};

export default function EventCard({
  title,
  image,
  category,
  time,
  location,
  distance,
  buttonText,
  badge,
  attendees = 0,
  participantImages = [],
  timeStatus,
  isOnline,
  className = "",
}: Props) {
  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  return (
    <div
      className={`group flex flex-col h-full rounded-[40px] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(113,88,0,0.08)] transition-all duration-500 ${className}`}
    >
      {/* IMAGE SECTION */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <Image
          src={image || "/placeholder-event.jpg"}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
          {/* ONLINE BADGE */}
          {isOnline && (
            <div className="px-3 py-1.5 bg-blue-600 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white shadow-xl border border-white/20">
              <Globe size={10} className="animate-pulse" />
              Online Event
            </div>
          )}
          {timeStatus && (
            <div
              className={`px-3 py-1.5 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white border border-white/20 shadow-xl ${
                timeStatus === "ongoing" ? "bg-green-500/80" : "bg-gray-900/80"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full bg-white ${timeStatus === "ongoing" ? "animate-pulse" : ""}`}
              />
              {timeStatus}
            </div>
          )}
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4 gap-3">
          <h2 className="font-black text-2xl text-gray-900 leading-[1.1] tracking-tight line-clamp-2 min-h-[3rem]">
            {title}
          </h2>
          <div
            className={`shrink-0 p-2 rounded-xl border ${categoryData.color} bg-opacity-5 flex items-center justify-center`}
          >
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {categoryData.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#715800]">
              <Clock size={14} />
            </div>
            <span className="font-bold text-xs text-gray-500 uppercase tracking-wide">
              {time}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#715800]">
              <MapPin size={14} />
            </div>
            <span className="font-bold text-xs text-gray-500 line-clamp-1">
              {isOnline ? "Link provided after join" : location}
              {!isOnline && distance && ` (${distance})`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
          <div className="flex items-center">
            <div className="flex -space-x-2.5 mr-3">
              {(participantImages.length > 0 ? participantImages : [1, 2, 3])
                .slice(0, 3)
                .map((img: any, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 relative rounded-full border-2 border-white overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={
                        typeof img === "string"
                          ? img
                          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}${i}`
                      }
                      alt="user"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 uppercase leading-none">
                {attendees || "0"}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Going
              </span>
            </div>
          </div>

          <button className="bg-gray-900 group-hover:bg-[#715800] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center gap-2">
            {buttonText}
            <ChevronRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
