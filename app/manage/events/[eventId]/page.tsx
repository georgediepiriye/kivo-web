/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Ticket as TicketIcon,
  TrendingUp,
  Plus,
  X,
  Shield,
  Download,
  Settings,
  ArrowLeft,
  Search,
  Mail,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";
import AuthGuard from "@/components/auth/AuthGuard";

// Perceived Performance Utility
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Attendee {
  buyerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tierName: string;
  status: "used" | "valid";
}

export interface EventData {
  event: {
    id: string;
    title: string;
    coOrganizers?: Array<{
      email: string;
      _id: string;
      name?: string;
      image?: string;
    }>;
  };
  attendees: Attendee[];
  metrics: {
    totalRevenue: number;
    totalTicketsSold: number;
    checkInCount: number;
  };
}

/**
 * Main Dashboard Component
 */
export default function ManageEventDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.eventId;

  // --- State Management ---
  const [data, setData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingCoOrg, setAddingCoOrg] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [coOrgEmail, setCoOrgEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Data Fetching ---
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/manage`,
        { credentials: "include" },
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setData(result.data);
      } else if (response.status === 401) {
        router.replace("/auth/signin");
      } else {
        setError(result.message || "Unauthorized access to this move.");
      }
    } catch (err) {
      setError("Unable to connect to Kivo servers.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchDashboardData();
  }, [id, fetchDashboardData]);

  // --- Handlers ---
  const handleAddCoOrg = async () => {
    if (!coOrgEmail) return toast.error("Please enter an email");

    setAddingCoOrg(true);
    await sleep(800); // UI Polish for "working" state

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/co-organizers`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: coOrgEmail }),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Partner added to the move!");
        setCoOrgEmail("");
        fetchDashboardData();
      } else {
        toast.error(result.message || "Could not add partner");
      }
    } catch (err) {
      toast.error("Network error. Try again.");
    } finally {
      setAddingCoOrg(false);
    }
  };

  const handleRemovePartner = async (partnerId: string) => {
    setConfirmDeleteId(null);
    setRemovingId(partnerId);

    await sleep(1000); // intentional delay for high-stakes UX

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/events/${id}/co-organizers/${partnerId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success("Access revoked successfully");
        fetchDashboardData();
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to remove partner");
      }
    } catch (err) {
      toast.error("Connection error. Try again.");
    } finally {
      setRemovingId(null);
    }
  };

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- Memoized Search & Pagination ---
  const { currentItems, totalPages } = useMemo(() => {
    if (!data) return { currentItems: [], totalPages: 0 };

    const filtered = data.attendees.filter(
      (a) =>
        `${a.buyerInfo.firstName} ${a.buyerInfo.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        a.buyerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const current = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const total = Math.ceil(filtered.length / itemsPerPage);

    return { currentItems: current, totalPages: total };
  }, [data, searchTerm, currentPage]);

  // --- Conditional Rendering for Loading/Error ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#FDFDFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#715800]/10 rounded-3xl" />
            <div className="absolute inset-0 border-4 border-t-[#715800] rounded-3xl animate-spin" />
          </div>
          <p className="text-[#715800] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Loading Analytics
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="bg-red-50 p-6 rounded-[2rem] text-center max-w-sm">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase text-red-900">
            Access Denied
          </h2>
          <p className="text-red-600/70 text-sm font-bold mt-2">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 w-full py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { event, metrics } = data;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans relative">
        <Toaster position="top-right" reverseOrder={false} />

        {/* Access Revoke Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
              onClick={() => setConfirmDeleteId(null)}
            />
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-red-900 leading-none">
                Revoke Access?
              </h3>
              <p className="text-slate-500 text-xs font-bold mt-3 leading-relaxed">
                This partner will immediately lose access to the guest list and
                real-time metrics for{" "}
                <span className="text-red-900">&quot;{event.title}&quot;</span>.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button
                  onClick={() => handleRemovePartner(confirmDeleteId)}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all"
                >
                  Confirm Revoke
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        )}

        <Navbar />

        <main
          className={`max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 transition-all duration-500 ${confirmDeleteId ? "blur-sm scale-[0.99] opacity-50 pointer-events-none" : ""}`}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-[#715800] transition-colors mb-4"
              >
                <ArrowLeft size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Back to Profile
                </span>
              </button>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
                {event?.title}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-3 py-1 bg-[#715800]/10 text-[#715800] rounded-full text-[10px] font-black uppercase tracking-widest">
                  Admin Mode
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  ID: {id?.toString().slice(-6)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/manage/events/settings/${event?.id}`);
                }}
                className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Settings size={14} /> Edit Move
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Analytics & Guests */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Total Revenue"
                  value={`₦${metrics.totalRevenue.toLocaleString()}`}
                  icon={<Wallet className="text-[#715800]" size={18} />}
                  trend="+12% from yesterday"
                />
                <MetricCard
                  label="Tickets Sold"
                  value={metrics.totalTicketsSold.toString()}
                  icon={<TicketIcon className="text-blue-500" size={18} />}
                />
                <MetricCard
                  label="Check-In Rate"
                  value={`${Math.round((metrics.checkInCount / (metrics.totalTicketsSold || 1)) * 100)}%`}
                  icon={<Users className="text-purple-500" size={18} />}
                  trend={`${metrics.checkInCount} / ${metrics.totalTicketsSold}`}
                />
              </div>

              {/* Guest List Container */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users size={16} className="text-[#715800]" /> Guest List
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Search guests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-slate-50 border border-transparent focus:border-[#715800]/20 focus:bg-white rounded-xl text-xs font-bold transition-all outline-none w-full md:w-64"
                      />
                    </div>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-[#715800] transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Attendee
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Access Tier
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentItems.length > 0 ? (
                        currentItems.map((t, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50/30 transition-colors group"
                          >
                            <td className="px-8 py-5">
                              <p className="font-black text-sm uppercase tracking-tight group-hover:text-[#715800] transition-colors">
                                {t.buyerInfo.firstName} {t.buyerInfo.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {t.buyerInfo.email}
                              </p>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-lg text-slate-600">
                                {t.tierName}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span
                                className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full ${t.status === "used" ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"}`}
                              >
                                {t.status === "used"
                                  ? "Checked-In"
                                  : "Valid Pass"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-20 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
                              No matching guests found
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#715800] transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 disabled:opacity-30 hover:text-[#715800] transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Access & Growth */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Shield size={16} className="text-[#715800]" /> Access Control
                </h3>

                <div className="space-y-3 mb-8">
                  {event.coOrganizers?.length ? (
                    event.coOrganizers.map((co) => (
                      <div
                        key={co._id}
                        className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {co.image ? (
                              <img
                                src={co.image}
                                className="w-full h-full object-cover"
                                alt="Partner"
                              />
                            ) : (
                              <Mail size={12} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 leading-none">
                              {co.name || "Kivo Member"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 mt-1">
                              {co.email}
                            </span>
                          </div>
                        </div>
                        <button
                          disabled={!!removingId}
                          onClick={() => setConfirmDeleteId(co._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                        >
                          {removingId === co._id ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-red-500"
                            />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-slate-300">
                        Solo Organizer
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Add Co-Organizer
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-slate-50 p-4 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#715800]/20 transition-all"
                      placeholder="Enter email address"
                      value={coOrgEmail}
                      onChange={(e) => setCoOrgEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCoOrg()}
                    />
                    <button
                      disabled={addingCoOrg}
                      onClick={handleAddCoOrg}
                      className="bg-slate-900 text-white p-4 rounded-xl hover:bg-[#715800] transition-colors active:scale-95 disabled:opacity-50"
                    >
                      {addingCoOrg ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                <TrendingUp className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24" />
                <h4 className="text-lg font-black uppercase tracking-tight relative z-10">
                  Expand Your Reach
                </h4>
                <p className="text-slate-400 text-xs mt-2 font-medium relative z-10 leading-relaxed">
                  Moves with at least one co-organizer see 40% higher ticket
                  sales on average in Port Harcourt.
                </p>
                <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#715800] relative z-10">
                  Learn More
                </button>
              </div>
            </aside>
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}

/**
 * Sub-component for individual metric cards
 */
const MetricCard = ({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm group hover:border-[#715800]/20 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      {trend && (
        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
      {label}
    </p>
    <p className="text-3xl font-black mt-1 tracking-tighter">{value}</p>
  </div>
);
