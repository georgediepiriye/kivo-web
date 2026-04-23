/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users, Ticket, LinkIcon, Trash2, Ban } from "lucide-react";
import { motion } from "framer-motion";

export const StepTicketing = ({ formData, updateForm }: any) => {
  const ticketingType = formData.ticketingType || "none";
  const tiers = formData.ticketTiers || [];

  const addTier = () => {
    const newTiers = [
      ...tiers,
      { name: "General Admission", price: 0, capacity: 50 },
    ];
    updateForm("ticketTiers", newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = tiers.filter((_: any, i: number) => i !== index);
    updateForm("ticketTiers", newTiers);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    updateForm("ticketTiers", newTiers);
  };

  // Helper for human-readable labels
  const TICKET_OPTIONS = [
    { id: "none", label: "No Tickets", sub: "Open entry", icon: Ban },
    { id: "internal", label: "Kivo Tickets", sub: "Sell on app", icon: Ticket },
    {
      id: "external",
      label: "External Link",
      sub: "Third-party",
      icon: LinkIcon,
    },
  ];

  return (
    <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
      {/* 1. Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TICKET_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = ticketingType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateForm("ticketingType", opt.id)}
              className={`p-6 rounded-[24px] border-2 flex flex-col items-center text-center gap-3 transition-all ${
                isActive
                  ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                  : "border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200"
              }`}
            >
              <Icon
                size={24}
                className={isActive ? "text-[#715800]" : "text-gray-300"}
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider">
                  {opt.label}
                </p>
                <p className="text-[9px] font-bold opacity-60 uppercase">
                  {opt.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Internal Ticketing UI */}
      {ticketingType === "internal" && (
        <div className="space-y-6 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-gray-400">
              Ticket Tiers
            </h3>
            <span className="text-[10px] font-bold text-[#715800] bg-[#715800]/10 px-3 py-1 rounded-full">
              {tiers.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {tiers.map((tier: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className="p-6 bg-gray-50 rounded-[32px] grid md:grid-cols-3 gap-6 relative border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Tier Name
                  </label>
                  <input
                    placeholder="e.g. Early Bird"
                    value={tier.name}
                    onChange={(e) => updateTier(idx, "name", e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 ring-[#715800]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(idx, "price", Number(e.target.value))
                    }
                    className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 ring-[#715800]/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">
                    Capacity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="100"
                      value={tier.capacity}
                      onChange={(e) =>
                        updateTier(idx, "capacity", Number(e.target.value))
                      }
                      className="w-full p-4 rounded-2xl bg-white font-bold text-sm outline-none shadow-sm focus:ring-2 ring-[#715800]/20"
                    />
                    <Users
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeTier(idx)}
                  className="absolute -top-2 -right-2 bg-white text-red-500 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          <button
            onClick={addTier}
            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[32px] text-[10px] font-black uppercase text-gray-400 hover:text-[#715800] hover:border-[#715800] hover:bg-[#715800]/5 transition-all"
          >
            + Add New Ticket Tier
          </button>
        </div>
      )}

      {/* 3. External Link UI */}
      {ticketingType === "external" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 pt-4 border-t border-gray-50"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              External Ticket URL
            </label>
            <div className="relative">
              <input
                placeholder="https://eventbrite.com/your-event"
                value={formData.externalTicketLink}
                onChange={(e) =>
                  updateForm("externalTicketLink", e.target.value)
                }
                className="w-full p-5 bg-gray-50 rounded-[24px] font-bold outline-none text-sm border border-transparent focus:border-[#715800] transition-all"
              />
              <LinkIcon
                size={16}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"
              />
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase ml-1">
              Followers will be redirected to this link to purchase tickets.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
