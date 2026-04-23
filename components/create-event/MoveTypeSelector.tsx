import { Zap, CalendarDays, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const MoveTypeSelector = ({
  onSelect,
}: {
  onSelect: (type: "activity" | "showcase") => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center max-w-2xl mx-auto py-10"
  >
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#715800]/5 text-[#715800] text-[10px] font-black uppercase mb-6">
      <Sparkles size={12} /> Start Something
    </div>
    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
      What&apos;s the <span className="text-[#715800]">Move?</span>
    </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12">
      <SelectionCard
        title="Activity"
        icon={<Zap size={28} />}
        desc="Casual meetups or quick sessions."
        onClick={() => onSelect("activity")}
      />
      <SelectionCard
        title="Showcase"
        icon={<CalendarDays size={28} />}
        desc="Concerts, summits, or productions."
        onClick={() => onSelect("showcase")}
      />
    </div>
  </motion.div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectionCard = ({ title, icon, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="p-8 bg-white rounded-[40px] border-2 border-gray-100 hover:border-[#715800] text-left transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-[#715800]/5 flex items-center justify-center text-[#715800] mb-6 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-black uppercase mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{desc}</p>
  </button>
);
