/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Bell,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isMounted: false,
    user: null as any,
  });

  // CRITICAL: Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (response.ok) {
        const result = await response.json();
        setAuthState({
          isLoggedIn: result.authenticated,
          isMounted: true,
          user: result.user,
        });
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      setAuthState({
        isLoggedIn: false,
        isMounted: true,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    const handleUpdate = () => checkAuth();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("auth-change", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("auth-change", handleUpdate);
    };
  }, [checkAuth]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState({ isLoggedIn: false, isMounted: true, user: null });
      setMobileMenuOpen(false);
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/map", label: "Map" },
    { href: "/discover", label: "Discover" },
    { href: "/create", label: "Add Event" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] bg-[#FDFDFB]/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center relative z-[110]">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10">
            <Cpu size={26} className="text-[#715800] z-10" />
            <div className="absolute w-8 h-8 bg-[#715800]/10 rounded-full animate-pulse"></div>
          </div>
          <span className="text-2xl font-black text-[#715800] tracking-tighter">
            Kivo
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-500 font-bold text-xs hover:text-[#715800] transition-all uppercase tracking-[0.15em]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {authState.isMounted && (
            <>
              {authState.isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-gray-400 cursor-pointer hover:text-[#715800] hidden sm:block"
                  />
                  <Link
                    href="/profile"
                    className="w-10 h-10 rounded-2xl overflow-hidden relative border-2 border-transparent hover:border-[#715800] transition-all bg-gray-100 flex items-center justify-center"
                  >
                    {authState.user?.image ? (
                      <Image
                        src={authState.user.image}
                        alt="P"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <UserIcon size={20} className="text-gray-400" />
                    )}
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Link
                    href="/auth/signin"
                    className="px-5 py-2.5 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-[#715800]"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2.5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}

          <button
            className="md:hidden w-11 h-11 flex items-center justify-center bg-gray-50 rounded-2xl text-[#715800] transition-transform active:scale-90"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 w-full h-screen bg-white z-[100] md:hidden flex flex-col pt-24"
          >
            <div className="flex-1 overflow-y-auto px-8 pb-12 flex flex-col">
              {/* User Section */}
              {authState.isLoggedIn && (
                <div className="py-6 flex items-center gap-4 border-b border-gray-50 mb-4">
                  <div className="w-14 h-14 rounded-3xl bg-gray-100 relative overflow-hidden flex-shrink-0">
                    {authState.user?.image ? (
                      <Image
                        src={authState.user.image}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="m-auto mt-4 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-xl tracking-tight leading-none mb-1">
                      {authState.user?.name || "Kivo User"}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#715800] text-[10px] font-black uppercase tracking-widest"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}

              {/* Links - Compacted sizes for better reachability */}
              <div className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-5 border-b border-gray-50/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-[#715800]">
                        {link.label}
                      </span>
                      <ChevronRight size={20} className="text-gray-300" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="mt-auto pt-10 space-y-4">
                {authState.isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-6 rounded-[24px] bg-red-50 text-red-500 font-black text-center text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-6 rounded-[24px] bg-black text-white font-black text-center text-lg shadow-xl active:scale-95 transition-all"
                    >
                      Create Account
                    </Link>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-6 rounded-[24px] bg-gray-100 text-gray-900 font-black text-center text-lg active:scale-95 transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
                {/* Safe area spacer for mobile home bars */}
                <div className="h-6" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
