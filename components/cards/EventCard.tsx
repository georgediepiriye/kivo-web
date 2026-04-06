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
  participants?: { name: string; avatar: string }[]; // NEW
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
  participants = [], // default empty
}: Props) {
  const categoryData = EVENT_CATEGORIES[category] ?? EVENT_CATEGORIES.social;

  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all">
      {/* IMAGE */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {badge && (
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {/* TITLE + CATEGORY */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-lg">{title}</h2>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${categoryData.color}`}
          >
            {categoryData.label}
          </span>
        </div>

        {/* TIME + LOCATION */}
        <div className="flex flex-col gap-1 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              schedule
            </span>
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              location_on
            </span>
            <span>
              {location}
              {distance && ` • ${distance} away`}
            </span>
          </div>
        </div>

        {/* PARTICIPANTS */}
        {/* PARTICIPANTS */}
        {participants.length > 0 && (
          <div className="flex items-center mt-3 mb-4">
            <div className="flex -space-x-3">
              {participants.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="w-10 h-10 relative rounded-full border-2 border-white overflow-hidden"
                >
                  <Image
                    src={p.avatar}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ))}
              {participants.length > 5 && (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                  +{participants.length - 5}
                </div>
              )}
            </div>
            <button className="ml-auto text-sm text-primary font-bold hover:underline">
              View All
            </button>
          </div>
        )}

        {/* BUTTON */}
        <button className="w-full bg-yellow-400 py-3 rounded-full font-semibold hover:bg-yellow-500 transition active:scale-95">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
