/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigation, MapPin, Repeat, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.SearchBox),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-full bg-gray-100 animate-pulse rounded-[24px]" />
    ),
  },
);

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const StepLogistics = ({
  formData,
  updateForm,
  useCurrentLocation,
  isLocating,
  handleRetrieve,
  setShowMapPicker,
}: any) => {
  const toggleDay = (day: string) => {
    const currentDays = formData.selectedDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];
    updateForm("selectedDays", newDays);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm space-y-8"
    >
      {/* 1. Format Toggle */}
      <div className="flex p-1 bg-gray-50 rounded-2xl w-fit">
        {["physical", "online", "hybrid"].map((f) => (
          <button
            key={f}
            onClick={() => updateForm("eventFormat", f)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
              formData.eventFormat === f
                ? "bg-white text-black shadow-sm"
                : "text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 2. Date & Time Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            Start
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => updateForm("startDate", e.target.value)}
              className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
            />
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => updateForm("startTime", e.target.value)}
              className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400">
            End
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => updateForm("endDate", e.target.value)}
              className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
            />
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => updateForm("endTime", e.target.value)}
              className="w-1/3 p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Recurrence Section */}
      <div className="pt-6 border-t border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-black uppercase flex items-center gap-2">
              <Repeat size={16} className="text-[#715800]" /> Recurring Move?
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Does this happen more than once?
            </p>
          </div>
          <button
            onClick={() => updateForm("isRecurring", !formData.isRecurring)}
            className={`w-14 h-8 rounded-full transition-all relative ${formData.isRecurring ? "bg-[#715800]" : "bg-gray-200"}`}
          >
            <motion.div
              animate={{ x: formData.isRecurring ? 24 : 4 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full transition-all"
            />
          </button>
        </div>

        <AnimatePresence>
          {formData.isRecurring && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Frequency
                  </label>
                  <select
                    value={formData.recurrenceFrequency ?? ""}
                    onChange={(e) =>
                      updateForm("recurrenceFrequency", e.target.value)
                    }
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                  >
                    <option value="none">Select...</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Every (Interval)
                  </label>
                  <input
                    type="number"
                    min="1" // Prevents using the arrow buttons to go below 1
                    placeholder="1"
                    value={formData.recurrenceInterval ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      // Logic: If the value is less than 1, force it to 1;
                      // if it's empty (deleted), set it to an empty string so they can type
                      if (val < 1) {
                        updateForm("recurrenceInterval", 1);
                      } else {
                        updateForm("recurrenceInterval", e.target.value);
                      }
                    }}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm focus:ring-2 ring-[#715800]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Ending On
                  </label>
                  <input
                    type="date"
                    value={formData.recurrenceEndDate ?? ""}
                    onChange={(e) =>
                      updateForm("recurrenceEndDate", e.target.value)
                    }
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none text-sm"
                  />
                </div>
              </div>

              {formData.recurrenceFrequency === "weekly" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Repeat On
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-12 h-12 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                          formData.selectedDays?.includes(day)
                            ? "border-[#715800] bg-[#715800] text-white"
                            : "border-gray-100 bg-gray-50 text-gray-400"
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Venue Section */}
      {formData.eventFormat !== "online" && (
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase text-gray-400">
              Venue
            </label>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="text-[10px] font-black text-[#715800] flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Navigation
                size={12}
                className={isLocating ? "animate-pulse" : ""}
              />{" "}
              {isLocating ? "Locating..." : "Use current location"}
            </button>
          </div>

          {/* The Mapbox Search Input */}
          <SearchBox
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            value={formData.location}
            onRetrieve={handleRetrieve}
            placeholder="Search venue..."
            theme={{
              variables: { borderRadius: "24px", fontFamily: "inherit" },
            }}
          />

          {/* --- NEW: LOCATION DETAILS DISPLAY --- */}
          {(formData.location || formData.neighborhood) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1"
            >
              <p className="text-[10px] font-black uppercase text-gray-400">
                Selected Address
              </p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {formData.location || "No address selected"}
              </p>
              {formData.neighborhood && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={10} className="text-[#715800]" />
                  <p className="text-[10px] text-[#715800] font-black uppercase">
                    Area: {formData.neighborhood}
                  </p>
                </div>
              )}
            </motion.div>
          )}
          {/* --- END OF NEW DISPLAY --- */}

          <button
            type="button"
            onClick={() => setShowMapPicker(true)}
            className={`w-full py-5 font-black text-[10px] uppercase rounded-2xl flex items-center justify-center gap-2 transition-all ${
              formData.locationCoords
                ? "bg-[#715800] text-white"
                : "bg-gray-900 text-white hover:bg-black"
            }`}
          >
            <MapPin size={16} />{" "}
            {formData.locationCoords ? "Location Pinned ✓" : "Drop Map Pin"}
          </button>
        </div>
      )}
    </motion.div>
  );
};
