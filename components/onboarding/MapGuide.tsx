// components/map/MapGuide.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Flame, LocateFixed } from "lucide-react";

interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const STEPS: GuideStep[] = [
  {
    title: "Event Markers",
    description:
      "Yellow dots are Upcoming events. Green dots with a 'LIVE' badge are happening right now! Pulse indicates high activity.",
    icon: (
      <div className="flex gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white" />
        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
      </div>
    ),
    color: "bg-green-50",
  },
  {
    title: "Hotspot Icons",
    description:
      "These are fixed popular locations. Icons tell you the vibe: 🎵 for Nightlife, 🍴 for Food, ☕ for Chill spots, and more.",
    icon: (
      <div className="w-10 h-10 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center shadow-md text-lg">
        🎵
      </div>
    ),
    color: "bg-orange-50",
  },
  {
    title: "Clusters",
    description:
      "Dark circles with numbers show multiple events in one area. Click them to zoom in and see individual markers.",
    icon: (
      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
        12
      </div>
    ),
    color: "bg-slate-50",
  },
  {
    title: "Quick Controls",
    description:
      "Use the Flame button to toggle Hotspots on/off. Use the Locate button to fly back to your current position.",
    icon: (
      <div className="flex gap-2">
        <div className="p-2 bg-white rounded-lg shadow-sm border">
          <Flame size={16} />
        </div>
        <div className="p-2 bg-white rounded-lg shadow-sm border">
          <LocateFixed size={16} />
        </div>
      </div>
    ),
    color: "bg-blue-50",
  },
];

export default function MapGuide({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : onClose());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div
          className={`h-40 ${STEPS[step].color} flex items-center justify-center transition-colors duration-500`}
        >
          {STEPS[step].icon}
        </div>

        <div className="p-8">
          <div className="flex gap-1 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === step ? "w-6 bg-black" : "w-2 bg-gray-200"}`}
              />
            ))}
          </div>

          <h3 className="text-2xl font-black tracking-tighter mb-2">
            {STEPS[step].title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {STEPS[step].description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="flex-[2] py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {step === STEPS.length - 1 ? "Get Started" : "Next"}{" "}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
