/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, ArrowRight } from "lucide-react";

// Components
import Navbar from "@/components/layout/NavBar";
import { StepHeader } from "@/components/create-event/FormElements";
import { MoveTypeSelector } from "@/components/create-event/MoveTypeSelector";
import { StepBasics } from "@/components/create-event/StepBasics";
import { StepLogistics } from "@/components/create-event/StepLogistics";
import { StepTicketing } from "@/components/create-event/StepTicketing";
import { StepFinal } from "@/components/create-event/StepFinal";
import { PreviewModal } from "@/components/create-event/PreviewModal";
import { EVENT_CATEGORIES } from "@/lib/categories";
import CreateEventMap from "@/components/map/CreateEventMap";

// --- AUTH GUARD MODAL COMPONENT ---
const AuthGuardModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-[#715800]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} className="text-[#715800]" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
          Kivo ID Required
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
          Only verified members can broadcast moves. Sign in to share your event
          with Port Harcourt.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full py-5 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Sign In Now <ArrowRight size={14} />
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-gray-400 font-black text-[10px] uppercase"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthGuard, setShowAuthGuard] = useState(false);

  // Form State
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
    meetingLink: "",
    isPublic: true,
    allowAnonymous: true,
    refundPolicy: "none",
    isRecurring: false,
    recurrenceFrequency: "none",
    recurrenceInterval: 1,
    recurrenceEndDate: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 1. Session Check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await res.json();
        if (res.ok && result.authenticated) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const updateForm = (field: string, value: any) => {
    if (field === "recurrenceInterval" && value !== "" && parseInt(value) < 1) {
      value = 1;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      const { coordinates } = feature.geometry;
      const placeName =
        feature.properties.full_address || feature.properties.name;
      const neighborhood = feature.properties.context?.neighborhood?.name || "";

      setFormData((prev) => ({
        ...prev,
        location: placeName,
        locationCoords: { lng: coordinates[0], lat: coordinates[1] },
        neighborhood: neighborhood,
      }));
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address,neighborhood,poi`,
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name;
        // Look for neighborhood in the context array
        const neighborhood =
          feature.context?.find((c: any) => c.id.startsWith("neighborhood"))
            ?.text || "";

        setFormData((prev) => ({
          ...prev,
          location: placeName,
          neighborhood: neighborhood || prev.neighborhood,
          locationCoords: { lat, lng },
        }));
      }
    } catch (error) {
      console.error("Geocoding failed", error);
      toast.error("Failed to get address details");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation)
      return toast.error("Browser doesn't support location");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Fetch the real address name
        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
        toast.success("Location detected");
      },
      () => {
        setIsLocating(false);
        toast.error("Unable to find you");
      },
      { enableHighAccuracy: true },
    );
  };

  const nextStep = () => {
    if (step === 1 && !isLoggedIn) {
      setShowAuthGuard(true);
      return;
    }
    if (step === 1 && (!formData.title || !formData.category)) {
      return toast.error("Title and Category are required.");
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) return setShowAuthGuard(true);
    setSubmitting(true);

    try {
      const categoryKey =
        Object.keys(EVENT_CATEGORIES).find(
          (k) => (EVENT_CATEGORIES as any)[k].label === formData.category,
        ) || formData.category;

      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...formData,
        category: categoryKey,
        tags: tagsArray,
        startDate: new Date(
          `${formData.startDate}T${formData.startTime}`,
        ).toISOString(),
        endDate: new Date(
          `${formData.endDate}T${formData.endTime}`,
        ).toISOString(),
        location:
          formData.eventFormat !== "online"
            ? {
                type: "Point",
                coordinates: [
                  formData.locationCoords?.lng,
                  formData.locationCoords?.lat,
                ],
                address: formData.location,
                neighborhood: formData.neighborhood || "Port Harcourt",
              }
            : null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Broadcast failed.");
      toast.success("Move Broadcasted!");
      router.push("/discover");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-slate-900 pb-32">
      <Toaster position="bottom-center" />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 md:pt-32">
        {step > 0 && (
          <StepHeader
            step={step}
            totalSteps={totalSteps}
            title={
              step === 1
                ? "Basics"
                : step === 2
                  ? "Logistics"
                  : step === 3
                    ? "Ticketing"
                    : "Final"
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
              handleRetrieve={handleRetrieve}
              useCurrentLocation={useCurrentLocation}
              isLocating={isLocating}
            />
          )}
          {step === 3 && (
            <StepTicketing formData={formData} updateForm={updateForm} />
          )}
          {step === 4 && (
            <StepFinal
              formData={formData}
              updateForm={updateForm}
              onPreview={() => setShowPreview(true)}
            />
          )}
        </AnimatePresence>

        {/* NAVIGATION BUTTONS */}
        {step > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t md:relative md:bg-transparent md:border-none md:mt-12 z-50">
            <div className="max-w-4xl mx-auto flex justify-between gap-4">
              <button
                onClick={() => setStep(step - 1)}
                className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase text-gray-400 bg-white border"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 md:flex-none px-12 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase shadow-xl"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex-1 md:flex-none px-12 py-4 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl"
                >
                  Preview & Broadcast
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MAP PICKER INTERFACE */}
      {/* MAP PICKER INTERFACE */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[700] bg-white flex flex-col">
          {/* Header with Close Button */}
          <div className="absolute top-6 left-6 right-6 z-[710] flex justify-between items-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl border border-slate-100 shadow-xl pointer-events-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#715800]">
                {formData.locationCoords
                  ? "Location Pinned"
                  : "Tap Map to Drop Pin"}
              </p>
            </div>
            <button
              onClick={() => setShowMapPicker(false)}
              className="p-4 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition pointer-events-auto"
            >
              <X size={20} />
            </button>
          </div>

          {/* THE ACTUAL MAP */}
          <div className="flex-1 w-full h-full">
            <CreateEventMap
              selectedCoords={formData.locationCoords}
              onSelect={(coords) => {
                // This updates the pin immediately
                updateForm("locationCoords", coords);
                // This fetches the real address for the "Venue" field
                reverseGeocode(coords.lat, coords.lng);
              }}
            />
          </div>

          {/* Bottom Confirmation Button */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[710] w-full max-w-xs px-4">
            <button
              onClick={() => setShowMapPicker(false)}
              className="w-full py-5 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={formData}
        preview={previewImage}
        submitting={submitting}
        onConfirm={handleSubmit}
      />

      <AuthGuardModal
        isOpen={showAuthGuard}
        onClose={() => setShowAuthGuard(false)}
      />
    </div>
  );
}
