"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import {
  ChevronLeft,
  RefreshCw,
  Zap,
  ShieldCheck,
  AlertCircle,
  Keyboard,
  Camera,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { db } from "@/lib/db";

export default function TicketScannerPage() {
  const params = useParams();
  const router = useRouter();

  // --- STATE ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    guestName?: string;
    tier?: string;
    message?: string;
  } | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [syncStatus, setSyncStatus] = useState<"syncing" | "idle" | "error">(
    "idle",
  );

  // --- REFS ---
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);

  // --- AUDIO INITIALIZATION ---
  useEffect(() => {
    successAudio.current = new Audio("/sounds/beep-success.mp3");
    errorAudio.current = new Audio("/sounds/beep-error.mp3");
    successAudio.current.load();
    errorAudio.current.load();
  }, []);

  const playSound = (type: "success" | "error") => {
    const audio =
      type === "success" ? successAudio.current : errorAudio.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  // --- SYNC ENGINE ---
  const performSync = useCallback(
    async (manual = false) => {
      if (!params.eventId || syncStatus === "syncing") return;
      setSyncStatus("syncing");
      try {
        const lastTicket = await db.tickets.orderBy("updatedAt").last();
        const since = lastTicket?.updatedAt
          ? new Date(lastTicket.updatedAt).getTime()
          : 0;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const url = `${baseUrl}/v1/tickets/event/${params.eventId}/sync?since=${since}`;

        const res = await fetch(url, { credentials: "include" });
        const result = await res.json();

        if (result.status === "success" && result.data.length > 0) {
          await db.tickets.bulkPut(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.data.map((t: any) => ({
              id: t._id,
              checkInCode: t.checkInCode,
              guestName: t.buyerInfo
                ? `${t.buyerInfo.firstName} ${t.buyerInfo.lastName}`
                : "Guest",
              tier: t.tierName,
              status: t.status,
              updatedAt: t.updatedAt,
            })),
          );
          if (manual) toast.success(`Synced ${result.data.length} records`);
        } else if (manual) {
          toast.success("Database up to date");
        }
        setSyncStatus("idle");
      } catch (err) {
        setSyncStatus("error");
        if (manual) toast.error("Sync failed");
      }
    },
    [params.eventId, syncStatus],
  );

  useEffect(() => {
    performSync();
  }, []);

  // --- CORE VALIDATION LOGIC ---
  const processValidation = useCallback(
    async (code: string) => {
      if (processingRef.current) return;
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode.startsWith("KIVO-") && !cleanCode.startsWith("REF-")) {
        if (showManualInput) toast.error("Invalid Code Format");
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);

      try {
        const ticket = await db.tickets
          .where("checkInCode")
          .equals(cleanCode)
          .first();

        if (!ticket) {
          playSound("error");
          setLastResult({ success: false, message: "INVALID TICKET" });
        } else if (ticket.status === "used" || ticket.status === "checked-in") {
          playSound("error");
          setLastResult({
            success: false,
            guestName: ticket.guestName,
            message: "ALREADY CHECKED IN",
          });
        } else {
          playSound("success");
          setLastResult({
            success: true,
            guestName: ticket.guestName,
            tier: ticket.tier,
          });

          await db.tickets.update(ticket.id, { status: "used" });
          await db.outbox.add({
            checkInCode: cleanCode,
            eventId: params.eventId as string,
            timestamp: Date.now(),
          });

          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
          fetch(`${baseUrl}/v1/tickets/check-in/${params.eventId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkInCode: cleanCode }),
            credentials: "include",
          })
            .then(async (res) => {
              if (res.ok) {
                const item = await db.outbox
                  .where("checkInCode")
                  .equals(cleanCode)
                  .first();
                if (item) await db.outbox.delete(item.id!);
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        toast.error("Database error.");
      } finally {
        setIsProcessing(false);
        setManualCode("");
        setTimeout(() => {
          processingRef.current = false;
        }, 2500);
      }
    },
    [params.eventId, showManualInput],
  );

  // --- CAMERA CONTROL ---
  const startScanner = useCallback(async () => {
    console.log("Attempting to start camera...");
    if (!scannerRef.current) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
    }

    if (scannerRef.current.isScanning) return;

    setCameraError(false);
    const config = {
      fps: 25,
      qrbox: { width: 260, height: 260 },
      aspectRatio: 1.0,
    };

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        processValidation,
        () => {},
      );
      setCameraReady(true);
    } catch (err) {
      try {
        await scannerRef.current.start(
          { facingMode: "user" },
          config,
          processValidation,
          () => {},
        );
        setCameraReady(true);
      } catch (secondErr) {
        setCameraError(true);
        setCameraReady(false);
      }
    }
  }, [processValidation]);

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [startScanner]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.length > 4) processValidation(manualCode);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col font-sans overflow-hidden">
      <Toaster position="top-center" />

      <header className="p-5 flex items-center justify-between bg-black/60 border-b border-white/5 z-50 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 active:scale-95 transition-all"
        >
          <ChevronLeft />
        </button>
        <div className="text-center">
          <h1 className="text-xs font-black uppercase tracking-widest text-white/90">
            Staff Scanner
          </h1>
          <button
            onClick={() => performSync(true)}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-1.5 mx-auto mt-1 text-[10px] font-bold text-yellow-500/60 uppercase tracking-tighter active:text-yellow-500"
          >
            <RefreshCw
              size={10}
              className={syncStatus === "syncing" ? "animate-spin" : ""}
            />
            {syncStatus === "syncing" ? "Syncing..." : "Refresh Guestlist"}
          </button>
        </div>
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${showManualInput ? "bg-yellow-500 border-yellow-600 text-black" : "bg-white/5 border-white/10 text-white"}`}
        >
          {showManualInput ? <Camera size={20} /> : <Keyboard size={20} />}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {showManualInput ? (
          <div className="w-full max-w-[320px] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-center text-yellow-500">
                Manual Entry
              </h3>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="KIVO-XXXXXX"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-center font-mono text-xl tracking-widest outline-none focus:border-yellow-500 transition-all uppercase"
                />
                <button
                  disabled={isProcessing || manualCode.length < 5}
                  className="w-full bg-yellow-500 disabled:bg-white/10 disabled:text-white/20 text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Validate <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[320px] aspect-square">
            <div
              className={`relative w-full h-full rounded-[3.5rem] overflow-hidden border-2 transition-all duration-500 ${isProcessing ? "border-yellow-500" : lastResult?.success ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : lastResult?.success === false ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-white/10"}`}
            >
              <div id="reader" className="w-full h-full object-cover" />

              {cameraError && (
                <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
                    Camera Blocked
                  </p>
                  <button
                    onClick={startScanner}
                    className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {cameraReady && !isProcessing && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-[2px] bg-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-scanner-line" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 w-full max-w-[320px] h-32 flex flex-col items-center justify-center">
          {lastResult ? (
            <div
              className={`w-full p-6 rounded-[2.5rem] border-2 animate-in fade-in zoom-in duration-300 ${lastResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {lastResult.success ? (
                  <ShieldCheck className="text-green-500" size={20} />
                ) : (
                  <AlertCircle className="text-red-500" size={20} />
                )}
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${lastResult.success ? "text-green-400" : "text-red-400"}`}
                >
                  {lastResult.success ? "Access Granted" : "Access Denied"}
                </span>
              </div>
              <h2 className="text-xl font-black uppercase truncate leading-tight">
                {lastResult.guestName || "Unregistered"}
              </h2>
              <p className="text-xs opacity-60 font-medium uppercase tracking-tight">
                {lastResult.tier || lastResult.message}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-20">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                {showManualInput ? "Awaiting Code Entry" : "Ready to Scan"}
              </p>
              <div className="mt-2 w-1 h-1 rounded-full bg-white animate-ping" />
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 flex justify-center">
        <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${cameraReady || showManualInput ? "bg-green-500" : "bg-red-500"} animate-pulse`}
          />
          <span className="text-[9px] font-bold uppercase text-white/40 tracking-widest">
            {showManualInput
              ? "Manual Input Enabled"
              : cameraReady
                ? "Hardware Active"
                : "Waiting for Access"}
          </span>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scanner-line {
          0% {
            top: 10%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 90%;
            opacity: 0;
          }
        }
        .animate-scanner-line {
          position: absolute;
          animation: scanner-line 3s ease-in-out infinite;
        }
        #reader video {
          object-fit: cover !important;
          border-radius: 3rem !important;
        }
        #reader__dashboard,
        #reader__status_span {
          display: none !important;
        }
        #reader {
          border: none !important;
        }
      `}</style>
    </div>
  );
}
