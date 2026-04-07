import { EVENT_CATEGORIES } from "@/lib/categories";
import Image from "next/image";

export type Props = {
  title: string;
  image: string;
  category: keyof typeof EVENT_CATEGORIES;
  time: string;
  location: string;
  distance?: string;
  buttonText: string;
  badge?: string;
  // ✅ UPDATED: Matching the data from your events file
  attendees: number;
  participantImages: string[];
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
}: Props) {
  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  return (
    <div className="group rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        {badge && (
          <div className="absolute top-4 left-4">
            <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className="font-black text-xl text-gray-900 leading-tight">
            {title}
          </h2>
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${categoryData.color}`}
          >
            {categoryData.label}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] opacity-70">
              schedule
            </span>
            <span className="font-medium">{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] opacity-70">
              location_on
            </span>
            <span className="font-medium line-clamp-1">
              {location}
              {distance && ` • ${distance}`}
            </span>
          </div>
        </div>

        {/* ATTENDEE STACK */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center">
            <div className="flex -space-x-3 mr-3">
              {participantImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="w-8 h-8 relative rounded-full border-2 border-white overflow-hidden shadow-sm"
                >
                  <Image
                    src={img}
                    alt="participant"
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ))}
              {attendees > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-black shadow-sm">
                  +{attendees - 4}
                </div>
              )}
            </div>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">
              {attendees} Going
            </span>
          </div>

          <button className="bg-yellow-400 px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-yellow-500 transition active:scale-95 shadow-sm">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
