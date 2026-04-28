/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageIcon, Settings2, Eye, Globe, UserCheck } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

// ✅ 1. Move Toggle OUTSIDE of the main component
const Toggle = ({ label, sub, value, field, updateForm }: any) => (
  <div className="flex items-center justify-between group">
    <div className="space-y-0.5">
      <p className="text-[10px] font-black uppercase text-white">{label}</p>
      <p className="text-[9px] font-bold text-gray-500 uppercase">{sub}</p>
    </div>
    <button
      type="button"
      onClick={() => updateForm(field, !value)}
      className={`w-12 h-7 rounded-full transition-all relative ${
        value ? "bg-[#715800]" : "bg-gray-700"
      }`}
    >
      <motion.div
        animate={{ x: value ? 22 : 4 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
      />
    </button>
  </div>
);

export const StepFinal = ({
  formData,
  updateForm,
  previewImage,
  handleImageChange,
  onPreview,
}: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT: Banner Upload */}
      <div className="lg:col-span-8">
        <div className="bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest">
            Event Banner
          </h3>
          <label className="block h-80 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-100 cursor-pointer overflow-hidden relative group transition-colors hover:border-[#715800]/20">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 group-hover:text-[#715800] transition-colors">
                <ImageIcon size={48} strokeWidth={1.5} />
                <span className="text-[10px] font-black uppercase mt-4">
                  Upload High-Res Cover
                </span>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      {/* RIGHT: Preferences & Action */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-xl space-y-8">
          <div className="flex items-center gap-2 text-[#715800] font-black text-[10px] uppercase tracking-widest">
            <Settings2 size={16} /> Advanced Settings
          </div>

          <div className="space-y-6">
            {/* ✅ 2. Pass updateForm to the Toggle component here */}
            <Toggle
              label="Public Visibility"
              sub="Show on Discovery Feed"
              value={formData.isPublic}
              field="isPublic"
              updateForm={updateForm}
            />

            <Toggle
              label="Allow Anonymous"
              sub="Guest check-ins allowed"
              value={formData.allowAnonymous}
              field="allowAnonymous"
              updateForm={updateForm}
            />

            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black uppercase text-gray-500">
                Refund Policy
              </label>
              <select
                value={formData.refundPolicy}
                onChange={(e) => updateForm("refundPolicy", e.target.value)}
                className="w-full bg-gray-800 text-white p-4 rounded-2xl font-bold text-xs outline-none border border-gray-700 focus:border-[#715800]"
              >
                <option value="none">No Refunds</option>
                <option value="24h">24h before event</option>
                <option value="7d">7 days before event</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
