"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Mail, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import { Suspense } from "react";

// 1. Create a separate component for the content that needs searchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref");

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100"
    >
      <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={40} className="text-green-500" />
      </div>

      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">
        You&apos;re In!
      </h1>

      <p className="text-gray-500 font-medium mb-8">
        Your spot has been secured. We&apos;ve sent your digital ticket and
        entry details to your email address.
      </p>

      <div className="bg-gray-50 rounded-3xl p-6 mb-8 text-left space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Mail size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">
              Order Reference
            </p>
            <p className="font-mono font-bold text-sm">
              {ref || "KIVO-TICKET"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Calendar size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">
              Next Step
            </p>
            <p className="font-bold text-sm text-slate-700">
              Add this to your calendar from the email.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push("/discover")}
        className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <ArrowLeft size={14} /> Explore More Moves
      </button>
    </motion.div>
  );
}

// 2. Wrap the whole thing in Suspense
export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border border-slate-100">
              <Loader2 className="animate-spin text-slate-200" size={32} />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Finalizing your move...
              </p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
