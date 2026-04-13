"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, PlusCircle, Bot } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Map", href: "/map", icon: Map },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "Create", href: "/create", icon: PlusCircle },
    { name: "AI", href: "/chat", icon: Bot },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 
      bg-[#f5f6f7]/90 backdrop-blur-2xl rounded-t-[2rem] md:hidden
      /* Added Border and Shadow below */
      border-t border-white/50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 ${
              isActive
                ? "bg-[#f8d472] text-[#715800] rounded-full scale-105"
                : "text-slate-500 active:scale-90"
            }`}
          >
            <IconComponent
              size={22}
              className={`mb-1 ${isActive ? "fill-current" : ""}`}
            />
            <span
              className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-70"}`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
