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

  // Initial state matches Server (SSR) to prevent hydration errors
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isMounted: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: null as any,
  });

  // Check authentication against the Backend (HttpOnly Cookies)
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Required to send HttpOnly cookies
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
    // Run auth check only once on client mount
    checkAuth();

    // Listener for cross-tab synchronization
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
      // 1. Tell backend to clear HttpOnly cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // 2. Clear local storage for safety
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 3. Update local state & redirect
      setAuthState({ isLoggedIn: false, isMounted: true, user: null });
      setMobileMenuOpen(false);
      router.push("/auth/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

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
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 cursor-pointer relative z-[60]"
        >
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
        <div className="flex items-center gap-3 relative z-[60]">
          {authState.isMounted ? (
            <>
              {authState.isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Bell
                    size={18}
                    className="text-gray-400 cursor-pointer hover:text-[#715800] transition-colors"
                  />

                  <button
                    onClick={handleSignOut}
                    className="hidden sm:flex w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center hover:bg-red-50 transition-colors group"
                  >
                    <LogOut
                      size={18}
                      className="text-gray-400 group-hover:text-red-500"
                    />
                  </button>

                  <Link
                    href="/profile"
                    className="w-10 h-10 rounded-2xl overflow-hidden relative border-2 border-transparent hover:border-[#715800] transition-all bg-gray-100 flex items-center justify-center"
                  >
                    {authState.user?.image ? (
                      <Image
                        src={authState.user.image}
                        alt="Profile"
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
          ) : (
            <div className="h-10 w-20" /> // Placeholder while mounting
          )}

          <button
            className="md:hidden w-11 h-11 flex items-center justify-center text-2xl bg-gray-50 rounded-2xl text-[#715800] transition-transform active:scale-90"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-white z-50 md:hidden flex flex-col"
          >
            <div className="h-24 px-8 flex items-center justify-between border-b"></div>

            <div className="flex-1 overflow-y-auto px-8 pb-10">
              {authState.isLoggedIn && (
                <div className="py-8 flex items-center gap-4 border-b border-gray-50 mb-6">
                  <div className="w-16 h-16 rounded-3xl bg-gray-100 relative overflow-hidden">
                    {authState.user?.image ? (
                      <Image
                        src={authState.user.image}
                        alt="User"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-xl tracking-tight leading-none mb-1">
                      {authState.user?.name || "Kivo User"}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#715800] text-xs font-black uppercase tracking-widest"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-5 border-b border-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-[#715800]">
                        {link.label}
                      </span>
                      <ChevronRight className="text-gray-300" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 space-y-4">
                {authState.isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-6 rounded-[24px] bg-red-50 text-red-500 font-black text-center text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
                ) : (
                  <>
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
                      className="block w-full py-6 rounded-[24px] bg-gray-50 text-gray-900 font-black text-center text-lg active:scale-95 transition-all"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
