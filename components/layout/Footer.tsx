"use client";

import { Cpu, Mail } from "lucide-react";
import { LuInstagram } from "react-icons/lu";
export default function Footer() {
  return (
    <footer className="hidden md:block w-full py-12 px-8 bg-primary mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex items-center justify-center">
              <Cpu size={26} className="text-[#715800] z-10" />
              <div className="absolute w-6 h-6 bg-primary-container rounded-full -z-0 opacity-70"></div>
            </div>
            <div className="text-xl font-extrabold tracking-tight font-headline text-white">
              Kivo
            </div>
          </div>
          <p className="text-sm font-['Inter'] text-white">© 2026 Kivo.</p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-8">
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline transition-opacity hover:opacity-80"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline transition-opacity hover:opacity-80"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline transition-opacity hover:opacity-80"
          >
            Contact Us
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex gap-6">
          <a
            href="#"
            className="text-white hover:text-[#715800] transition-colors"
            aria-label="Instagram"
          >
            <LuInstagram size={22} />
          </a>
          <a
            href="#"
            className="text-white hover:text-[#715800] transition-colors"
            aria-label="Email"
          >
            <Mail size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
