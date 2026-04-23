/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Layout & Global Components
import Navbar from "@/components/layout/NavBar";

// Section Components
import { StepHeader } from "@/components/create-event/FormElements";
import { MoveTypeSelector } from "@/components/create-event/MoveTypeSelector";
import { StepBasics } from "@/components/create-event/StepBasics";
import { StepLogistics } from "@/components/create-event/StepLogistics";
import { StepTicketing } from "@/components/create-event/StepTicketing";
import { StepFinal } from "@/components/create-event/StepFinal";
import { PreviewModal } from "@/components/create-event/PreviewModal";
import CreateEventMap from "@/components/map/CreateEventMap";

import { EVENT_CATEGORIES } from "@/lib/categories";

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const totalSteps = 4;

  // --- CONSOLIDATED STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    type: null as "activity" | "showcase" | null,
    eventFormat: "physical" as "physical" | "online" | "hybrid",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    neighborhood: "",
    locationCoords: null as { lat: number; lng: number } | null,
    ticketingType: "none" as "none" | "internal" | "external",
    ticketTiers: [] as any[],
    externalTicketLink: "",
    joinLink: "",
    meetingLink: "",
    isPublic: true,
    allowAnonymous: true,
    refundPolicy: "none",
    isRecurring: false,
    recurrenceFrequency: "none",
    recurrenceInterval: 1,
    recurrenceEndDate: "",
    selectedDays: [] as string[],
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // --- HELPER: Update Form State ---
  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- MAP & LOCATION HANDLERS ---
  const useCurrentLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported by browser");

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateForm("locationCoords", coords);
        updateForm("location", "Pinned Location (GPS)");
        setIsLocating(false);
        toast.success("Location detected!");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Could not get location");
      },
    );
  };

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    const coords = {
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
    };

    // Mapbox context usually contains neighborhood/locality info
    const neighborhood =
      feature.properties.context?.neighborhood?.name ||
      feature.properties.context?.place?.name ||
      "Port Harcourt";

    const fullAddress =
      feature.properties.full_address || feature.properties.name;

    updateForm("location", fullAddress);
    updateForm("neighborhood", neighborhood);
    updateForm("locationCoords", coords);
  };

  const handleMapSelect = (coords: { lat: number; lng: number }) => {
    // Update the coordinates immediately for the pin
    updateForm("locationCoords", coords);

    // Fetch the human-readable address for those coordinates
    reverseGeocode(coords.lat, coords.lng);
  };

  // --- FORM HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.category))
      return toast.error("Title and Category are required.");
    if (step === 2 && !formData.startDate)
      return toast.error("Please select a start date.");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return router.push("/auth/signin");
    setSubmitting(true);

    try {
      // 1. Transform tags into an array
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];
      const categoryKey =
        Object.keys(EVENT_CATEGORIES).find(
          (k) => (EVENT_CATEGORIES as any)[k].label === formData.category,
        ) || formData.category;

      // 2. Build the Location Object
      let locationPayload = null;
      if (formData.eventFormat !== "online" && formData.locationCoords) {
        locationPayload = {
          type: "Point",
          coordinates: [
            formData.locationCoords.lng,
            formData.locationCoords.lat,
          ],
          address: formData.location,
          neighborhood: formData.neighborhood || "Port Harcourt",
        };
      }

      // 3. Combine Dates and Times into ISO strings
      const startISO = new Date(
        `${formData.startDate}T${formData.startTime}`,
      ).toISOString();
      const endISO = new Date(
        `${formData.endDate}T${formData.endTime}`,
      ).toISOString();

      // 4. Build Final Payload
      const payload = {
        title: formData.title,
        description: formData.description,
        eventFormat: formData.eventFormat,
        isOnline: formData.eventFormat !== "physical",
        type: formData.type, // e.g. "activity"
        category: categoryKey,
        tags: tagsArray,
        startDate: startISO,
        endDate: endISO,
        location: locationPayload,
        isPublic: formData.isPublic,
        allowAnonymous: formData.allowAnonymous,
        ticketingType: formData.ticketingType,
        ticketTiers:
          formData.ticketingType === "internal" ? formData.ticketTiers : [],
        externalTicketLink:
          formData.ticketingType === "external"
            ? formData.externalTicketLink
            : "",
        meetingLink: formData.meetingLink || "",
        isRecurring: formData.isRecurring,
        recurrence: formData.isRecurring
          ? {
              frequency: formData.recurrenceFrequency,
              interval: Number(formData.recurrenceInterval) || 1,
              endDate: formData.recurrenceEndDate
                ? new Date(formData.recurrenceEndDate).toISOString()
                : undefined,
            }
          : undefined,
        refundPolicy: formData.refundPolicy,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        // If Zod fails on backend, it usually sends back an array of errors
        throw new Error(result.message || "Failed to broadcast move.");
      }

      toast.success("Broadcasted!");
      router.push("/discover");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        // Extract the main address
        const address = feature.place_name;

        // Extract neighborhood/area
        const neighborhood =
          feature.context?.find((c: any) => c.id.includes("neighborhood"))
            ?.text ||
          feature.context?.find((c: any) => c.id.includes("locality"))?.text ||
          "Port Harcourt";

        updateForm("location", address);
        updateForm("neighborhood", neighborhood);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900 pb-32 md:pb-12">
      <Toaster position="bottom-center" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-24 md:pt-32">
        {step > 0 && (
          <StepHeader
            step={step}
            totalSteps={totalSteps}
            title={
              step === 1
                ? "The Basics"
                : step === 2
                  ? "Logistics"
                  : step === 3
                    ? "Ticketing"
                    : "Final Touches"
            }
          />
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <MoveTypeSelector
              onSelect={(type) => {
                updateForm("type", type);
                setStep(1);
              }}
            />
          )}

          {step === 1 && (
            <StepBasics
              formData={formData}
              updateForm={updateForm}
              categories={Object.values(EVENT_CATEGORIES).map((c) => c.label)}
            />
          )}

          {step === 2 && (
            <StepLogistics
              formData={formData}
              updateForm={updateForm}
              setShowMapPicker={setShowMapPicker}
              useCurrentLocation={useCurrentLocation}
              isLocating={isLocating}
              handleRetrieve={handleRetrieve}
            />
          )}

          {step === 3 && (
            <StepTicketing formData={formData} updateForm={updateForm} />
          )}

          {step === 4 && (
            <StepFinal
              formData={formData}
              updateForm={updateForm}
              previewImage={previewImage}
              handleImageChange={handleImageChange}
              onPreview={() => setShowPreview(true)}
            />
          )}
        </AnimatePresence>

        {/* --- GLOBAL NAVIGATION --- */}
        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FDFCF9]/90 backdrop-blur-md border-t z-[100] md:relative md:bg-transparent md:border-none md:p-0 md:mt-12">
            <div className="max-w-4xl mx-auto flex justify-between gap-4">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase text-gray-400 bg-white border"
              >
                Previous
              </button>
              {step < 4 && (
                <button
                  onClick={nextStep}
                  className="flex-1 md:flex-none px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MAP PICKER OVERLAY --- */}
      <AnimatePresence>
        {showMapPicker && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b bg-white">
              <div className="flex flex-col">
                <h2 className="text-[10px] font-black uppercase">
                  Location Picker
                </h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase">
                  Tap map to drop pin
                </p>
              </div>
              <button
                onClick={() => setShowMapPicker(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 relative">
              <CreateEventMap
                selectedCoords={formData.locationCoords}
                onSelect={handleMapSelect}
              />

              <div className="absolute bottom-10 left-0 right-0 px-6 pointer-events-none">
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="pointer-events-auto w-full max-w-md mx-auto py-5 bg-gray-900 text-white font-black text-[10px] uppercase rounded-2xl shadow-2xl block"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={formData}
        preview={previewImage}
        submitting={submitting}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
