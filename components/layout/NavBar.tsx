"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Bell, ChevronRight, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isMounted: false,
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const token = localStorage.getItem("token");
      setAuthState({
        isLoggedIn: !!token,
        isMounted: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setAuthState({ ...authState, isLoggedIn: false });
    setMobileMenuOpen(false);
    router.push("/auth/signin");
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
        {/* LOGO SECTION */}
        <Link
          href="/"
          className="flex items-center gap-2 cursor-pointer relative z-[60]"
        >
          <div className="relative flex items-center justify-center w-10 h-10">
            <Cpu size={26} className="text-[#715800] z-10" />
            <div className="absolute w-8 h-8 bg-[#715800]/10 rounded-full -z-0 animate-pulse"></div>
          </div>
          <span className="text-2xl font-black text-[#715800] tracking-tighter">
            Kivo
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
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

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-3 relative z-[60]">
          {authState.isMounted && (
            <>
              {authState.isLoggedIn ? (
                <>
                  <Bell
                    size={18}
                    className="text-gray-400 group-hover:text-red-500"
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
                    className="w-10 h-10 rounded-2xl overflow-hidden relative border-2 border-transparent hover:border-[#715800] transition-all"
                  >
                    <Image
                      src="/images/profile.jpg"
                      alt="User profile"
                      fill
                      className="object-cover"
                      sizes="40px"
                      priority
                    />
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-2">
                  <Link
                    href="/auth/signin"
                    className="px-5 py-2.5 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-[#715800] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-2.5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[#715800] transition-all shadow-lg shadow-black/5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
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
            <div className="h-24" />

            <div className="flex-1 overflow-y-auto px-8 pb-10">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-8">
                Menu
              </p>

              <div className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.href}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-5 border-b border-gray-50 hover:px-2 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-[#715800]">
                        {link.label}
                      </span>
                      <ChevronRight className="text-gray-300 group-hover:text-[#715800] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {authState.isMounted && (
                <div className="mt-12 space-y-4">
                  {!authState.isLoggedIn ? (
                    <>
                      <Link
                        href="/auth/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-5 rounded-[24px] bg-black text-white font-black text-center text-lg shadow-xl shadow-black/10 active:scale-95 transition-all"
                      >
                        Create Account
                      </Link>
                      <Link
                        href="/auth/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-5 rounded-[24px] bg-gray-50 text-gray-900 font-black text-center text-lg active:scale-95 transition-all"
                      >
                        Sign In
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleSignOut}
                      className="w-full py-5 rounded-[24px] bg-red-50 text-red-500 font-black text-center text-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  )}
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Kivo Social Discovery Hub
                </p>
                <p className="text-xs text-gray-300 font-medium italic">
                  Made for Port Harcourt.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
