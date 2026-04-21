"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    reference ? "verifying" : "error",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticketData, setTicketData] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);

  const isVerifying = useRef(false);

  /**
   * RE-ROUTING LOGIC
   * Checks for token only when called to avoid React render errors.
   */
  const handleMoveNavigation = (authPath: string, guestPath: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push(authPath);
    } else {
      router.push(guestPath);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#715800", "#000000", "#FFD700"],
    });
  };

  const verifyOrder = useCallback(
    async (ref: string) => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/verify/${ref}`,
          { cache: "no-store" },
        );
        const result = await res.json();

        if (
          result.status === "success" &&
          result.data.order?.status === "completed"
        ) {
          setTicketData({
            eventTitle: result.data.order.event.title,
            tierName: result.data.order.tierName,
            quantity: result.data.order.quantity,
            ticketCode:
              result.data.tickets?.[0]?.ticketCode || "KIVO-PROCESSING",
          });

          setStatus("success");
          triggerCelebration();
        } else if (attempts < 10) {
          setTimeout(() => {
            isVerifying.current = false;
            setAttempts((prev) => prev + 1);
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Kivo verification error:", error);
        if (attempts >= 10) {
          setStatus("error");
        } else {
          setTimeout(() => {
            isVerifying.current = false;
            setAttempts((prev) => prev + 1);
          }, 2000);
        }
      }
    },
    [attempts],
  );

  useEffect(() => {
    if (!reference || status !== "verifying") return;

    (async () => {
      await verifyOrder(reference);
    })();
  }, [reference, attempts, verifyOrder, status]);

  // --- RENDER LOGIC ---

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="relative">
          <Loader2 className="animate-spin text-[#715800]" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-ping" />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-black uppercase italic tracking-tighter text-center">
          Securing your spot...
        </h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-center">
          Verifying move with Kivo servers
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[30px] flex items-center justify-center mb-6 mx-auto">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          Verification Failed
        </h2>
        <p className="text-gray-500 text-sm font-medium mt-2 max-w-xs mx-auto">
          We couldn&apos;t confirm your payment link. If you were debited, check
          your email for the ticket!
        </p>
        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="mt-8 px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-black/20"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[30px] flex items-center justify-center shadow-xl shadow-green-100/30">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Ticket Secured.
          </h1>
          <p className="text-gray-500 font-medium">
            Ready for{" "}
            <span className="text-black font-black uppercase italic">
              {ticketData?.eventTitle}
            </span>
          </p>
        </div>

        {/* Ticket UI */}
        <div className="bg-white border-2 border-black rounded-[40px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Access Type
                </p>
                <p className="text-lg font-black uppercase leading-tight italic">
                  {ticketData?.tierName}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#715800]">
                <Ticket size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Entry Code
              </p>
              <p className="text-2xl font-mono font-black tracking-widest text-black uppercase">
                {ticketData?.ticketCode || "PROCESSING"}
              </p>
            </div>
            <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Guests
                </p>
                <p className="font-black text-sm uppercase">
                  {ticketData?.quantity} Person(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </p>
                <p className="font-black text-green-500 uppercase italic text-sm">
                  Active
                </p>
              </div>
            </div>
          </div>
          <div className="bg-black p-4 text-center">
            <p className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
              Present this code at the gate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-5 bg-gray-100 rounded-3xl font-black text-[10px] uppercase">
            <Download size={16} /> Save Pass
          </button>
          <button className="flex items-center justify-center gap-2 py-5 bg-gray-100 rounded-3xl font-black text-[10px] uppercase">
            <Share2 size={16} /> Share Move
          </button>
        </div>

        <button
          onClick={() => handleMoveNavigation("/profile", "/discover")}
          className="w-full flex items-center justify-center gap-2 py-6 bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10"
        >
          Return to City <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-200" />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
