"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
  Share2,
  Info,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import toast from "react-hot-toast";
import { TICKET_STATUS } from "@/lib/constants";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/tickets/${params.id}`,
          { method: "GET", credentials: "include" },
        );
        const result = await response.json();

        if (response.ok && result.status === "success") {
          setTicket(result.data);
        } else {
          toast.error("Could not load ticket");
          router.push("/profile");
        }
      } catch (error) {
        console.error("Ticket Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchTicketDetails();
  }, [params.id, router]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-pulse font-black text-[10px] uppercase tracking-widest text-[#715800]">
          Retrieving Digital Pass...
        </div>
      </div>
    );

  if (!ticket) return null;

  // Map the status from DB to your TICKET_STATUS constants
  const statusKey = (ticket.status as keyof typeof TICKET_STATUS) || "valid";
  const statusConfig = TICKET_STATUS[statusKey];

  const eventDate = new Date(ticket.event.startDate).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const eventTime = new Date(ticket.event.startDate).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 pt-28">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Profile
        </button>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#715800] to-[#f8d472] rounded-[3rem] blur opacity-10" />

          <div className="relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            {/* Event Banner */}
            <div className="relative h-48 w-full bg-slate-100">
              {ticket.event.image ? (
                <Image
                  src={ticket.event.image}
                  alt={ticket.event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#121212] flex items-center justify-center">
                  <h2 className="text-white font-black italic uppercase opacity-20 text-4xl">
                    Kivo Move
                  </h2>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-[#715800] text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {ticket.tierName}
                </span>
                <h1 className="text-2xl font-black text-white uppercase mt-2 leading-tight tracking-tighter">
                  {ticket.event.title}
                </h1>
              </div>
            </div>

            {/* QR Section */}
            <div className="p-8 flex flex-col items-center text-center">
              <div
                className={`p-4 bg-white border-[6px] rounded-[2rem] shadow-sm mb-6 transition-colors duration-500`}
                style={{
                  borderColor:
                    statusKey === "valid" ? "#000000" : statusConfig.color,
                }}
              >
                <div
                  className={
                    statusKey !== "valid" ? "opacity-30 grayscale" : ""
                  }
                >
                  <QRCodeSVG
                    value={ticket.checkInCode}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Entry Code
                </p>
                <h3 className="text-xl font-mono font-black text-[#715800]">
                  {ticket.checkInCode}
                </h3>
              </div>

              {/* Status Badge - Dynamically colored by your constants */}
              <div
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: `${statusConfig.color}10`,
                  borderColor: `${statusConfig.color}30`,
                  color: statusConfig.color,
                }}
              >
                {statusKey === "valid" && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />{" "}
                    {statusConfig.label}
                  </>
                )}
                {statusKey === "used" && (
                  <>
                    <ShieldCheck size={14} /> {statusConfig.label}
                  </>
                )}
                {statusKey === "refunded" && (
                  <>
                    <RefreshCcw size={14} /> {statusConfig.label}
                  </>
                )}
                {statusKey === "cancelled" && (
                  <>
                    <XCircle size={14} /> {statusConfig.label}
                  </>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="px-8 pb-8 grid grid-cols-2 gap-6 border-t border-dashed border-slate-200 pt-8 mt-2">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={10} /> Date
                </p>
                <p className="text-sm font-black uppercase">{eventDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={10} /> Time
                </p>
                <p className="text-sm font-black uppercase">{eventTime}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={10} /> Venue
                </p>
                <p className="text-sm font-black uppercase truncate">
                  {ticket.event.location?.address || "Port Harcourt, Nigeria"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase">
                  Admit One
                </span>
                <span className="text-[11px] font-black uppercase">
                  {ticket.buyerInfo.firstName} {ticket.buyerInfo.lastName}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300">
                #{ticket.ticketCode}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">
            <Download size={14} /> Save Image
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">
            <Share2 size={14} /> Send Pass
          </button>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
            {statusKey === "valid"
              ? "Do not share this QR code. It will be scanned at the entrance and can only be used once."
              : `This pass is currently marked as ${statusConfig.label.toLowerCase()}.`}
          </p>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
