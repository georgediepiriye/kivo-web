/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  Tag,
  X,
  Navigation,
} from "lucide-react";
import Image from "next/image";

export const PreviewModal = ({
  isOpen,
  onClose,
  data,
  preview,
  submitting,
  onConfirm,
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* 1. Image Preview Section */}
        <div className="relative h-60 w-full bg-gray-100">
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <Sparkles size={40} />
              <p className="text-[10px] font-black uppercase mt-2">No Image</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 bg-[#715800] text-white text-[9px] font-black uppercase rounded-full tracking-wider">
              {data.category || "General"}
            </span>
            <h2 className="text-white text-2xl font-black uppercase mt-2 line-clamp-2">
              {data.title || "Untitled Move"}
            </h2>
          </div>
        </div>

        {/* 2. Details Section */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Date Info */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#715800]" /> Date & Time
              </p>
              <div className="text-xs font-bold text-gray-900">
                <p>
                  {data.startDate
                    ? new Date(data.startDate).toDateString()
                    : "TBD"}
                </p>
                <p className="text-[#715800] mt-0.5">
                  {data.startTime || "00:00"}
                </p>
              </div>
            </div>

            {/* Venue Info - IMPROVED LOCATION DISPLAY */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5">
                <MapPin size={12} className="text-[#715800]" /> Venue
              </p>
              <div className="text-xs font-bold text-gray-900">
                <p className="line-clamp-2 leading-tight">
                  {data.location || "Location not set"}
                </p>
                {data.neighborhood && (
                  <p className="text-[9px] text-[#715800] uppercase font-black mt-1 flex items-center gap-1">
                    <Navigation size={8} /> {data.neighborhood}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1.5">
              <Tag size={12} className="text-[#715800]" /> Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {data.tags &&
              typeof data.tags === "string" &&
              data.tags.trim() !== "" ? (
                data.tags.split(",").map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="text-[9px] font-black uppercase bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-gray-600"
                  >
                    #{tag.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-bold text-gray-300 italic">
                  No tags added
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="p-8 pt-0 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-5 bg-gray-50 hover:bg-gray-100 rounded-[24px] font-black text-[10px] uppercase transition-all"
          >
            Edit Move
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-5 bg-[#715800] hover:bg-[#8b6d00] text-white rounded-[24px] font-black text-[10px] uppercase shadow-lg shadow-[#715800]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={14} />
                <span>Broadcasting...</span>
              </div>
            ) : (
              "Confirm & Broadcast"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
