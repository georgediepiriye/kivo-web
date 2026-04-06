"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/map", label: "Discover" },
    { href: "/feed", label: "Feed" },
    { href: "/chat", label: "AI Assistant" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f5f6f7]/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10">
            <span className="material-symbols-outlined text-[#715800] text-3xl z-10">
              sensors
            </span>
            <div className="absolute w-8 h-8 bg-primary-container rounded-full -z-0 logo-pulse"></div>
          </div>
          <span className="text-2xl font-extrabold text-[#715800] tracking-tight">
            Kivo
          </span>
        </div>

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

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-[#f8d472]/10 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <Image
              src="/images/profile.jpg"
              alt="User profile"
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button className="px-5 py-2 text-slate-600 font-semibold hover:text-[#715800] transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-full font-bold shadow-sm hover:bg-primary-fixed-dim active:scale-95 transition-all">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-2xl"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#f5f6f7]/90 backdrop-blur-md shadow-md px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 font-medium hover:text-[#715800] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 mt-2">
            <button className="px-5 py-2 text-slate-600 font-semibold hover:text-[#715800] transition-colors">
              Sign In
            </button>
            <button className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-full font-bold shadow-sm hover:bg-primary-fixed-dim active:scale-95 transition-all">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
