"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import CreateEventMap, { MapRef } from "@/components/map/CreateEventMap";

const categories = [
  "Music",
  "Sports",
  "Education",
  "Technology",
  "Food & Drink",
  "Networking",
  "Health & Fitness",
  "Other",
];

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<"event" | "activity">("activity");
  const [isPaid, setIsPaid] = useState(false);
  const [fee, setFee] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");

  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (!locationCoords) {
        alert("Please select a location on the map.");
        setSubmitting(false);
        return;
      }

      console.log({
        title,
        description,
        category,
        date,
        time,
        location,
        locationCoords,
        image,
        type,
        isPaid,
        fee,
        maxParticipants,
        isPublic,
        allowAnonymous,
      });

      alert(`${type === "event" ? "Event" : "Activity"} created successfully!`);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setDate("");
      setTime("");
      setLocation("");
      setLocationCoords(null);
      setImage(null);
      setType("activity");
      setIsPaid(false);
      setFee(0);
      setMaxParticipants("");
      setIsPublic(true);
      setAllowAnonymous(false);
      setShowMapPicker(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <div className="h-[72px] md:h-[96px]" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 space-y-6 mb-32 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center mb-4">
          Create New {type === "event" ? "Event" : "Activity"}
        </h1>

        {/* Type Toggle */}
        <div className="bg-surface-container-low p-1.5 rounded-full flex items-center w-fit mx-auto mb-6">
          <button
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              type === "activity"
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            onClick={() => setType("activity")}
          >
            Activity
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              type === "event"
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            onClick={() => setType("event")}
          >
            Event
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Give it a catchy name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe your event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none resize-none h-32 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="flex-1 px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="px-4 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dim transition"
              >
                Pick on Map
              </button>
            </div>
            {showMapPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-surface-container-highest rounded-3xl w-[90%] max-w-lg h-[70vh] flex flex-col p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Select Location</h2>
                    <button
                      onClick={() => setShowMapPicker(false)}
                      className="text-gray-700 font-bold text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1">
                    <CreateEventMap
                      ref={mapRef}
                      selectedCoords={locationCoords}
                      onSelect={setLocationCoords}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Event Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-gray-600"
            />
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="mt-3 rounded-2xl object-cover w-full h-60"
              />
            )}
          </div>

          {/* Paid/Free, Fee & Max Participants */}
          <div className="bg-secondary-container/30 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  placeholder="20"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-secondary/30 focus:ring-2 focus:ring-secondary outline-none transition"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary mb-1">
                  Entrance Fee (₦)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={fee}
                  onChange={(e) => {
                    setFee(Number(e.target.value));
                    setIsPaid(Number(e.target.value) > 0);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-secondary/30 focus:ring-2 focus:ring-secondary outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Who Can Join */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Event Visibility
              </label>
              <select
                value={isPublic ? "public" : "private"}
                onChange={(e) => setIsPublic(e.target.value === "public")}
                className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface-variant mb-1">
                Who Can Join/View
              </label>
              <select
                value={allowAnonymous ? "anyone" : "verified"}
                onChange={(e) => setAllowAnonymous(e.target.value === "anyone")}
                className="w-full px-4 py-3 rounded-2xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none transition"
              >
                <option value="verified">Verified Users Only</option>
                <option value="anyone">Verified + Anonymous Users</option>
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Button */}
      <div className="md:hidden fixed bottom-[88px] left-0 w-full p-4 bg-surface border-t shadow-lg z-40">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-dim transition disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create & Notify Nearby"}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <MobileNav />
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block mt-8">
        <Footer />
        <div className="h-16"></div>
      </div>
    </div>
  );
}
