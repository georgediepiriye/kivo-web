"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import { Cpu, Bell } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/map", label: "Discover" },
    { href: "/feed", label: "Feed" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f5f6f7]/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10">
            <Cpu size={28} className="text-[#715800] z-10" />
            <div className="absolute w-8 h-8 bg-primary-container rounded-full -z-0 logo-pulse"></div>
          </div>
          <span className="text-2xl font-extrabold text-[#715800] tracking-tight">
            Kivo
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 font-medium hover:text-[#715800] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-[#f8d472]/10 transition-colors active:scale-95">
            <Bell size={20} className="text-on-surface-variant" />
          </button>

          <Link
            href="/profile"
            className="w-10 h-10 rounded-full overflow-hidden relative"
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

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="px-5 py-2 text-slate-600 font-semibold hover:text-[#715800] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 text-slate-600 font-semibold hover:text-[#715800] transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-2xl"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-xl px-6 py-6 flex flex-col gap-4 border-t border-gray-100 absolute w-full left-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-700 text-lg font-semibold hover:text-[#715800] transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 rounded-2xl bg-gray-100 text-slate-700 font-bold hover:bg-gray-200 transition-all active:scale-[0.98] text-center"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 rounded-2xl bg-[#715800] text-white font-bold hover:bg-[#5a4600] shadow-lg shadow-[#715800]/20 transition-all active:scale-[0.98] text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
