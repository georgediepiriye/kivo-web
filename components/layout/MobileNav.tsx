"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: "home" },
    { name: "Discover", href: "/map", icon: "explore" },
    { name: "Create", href: "/create", icon: "add_circle" },
    { name: "Feed", href: "/feed", icon: "layers" },
    { name: "AI", href: "/ai", icon: "smart_toy" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 
      bg-[#f5f6f7]/80 backdrop-blur-2xl rounded-t-[1.5rem] md:hidden"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all ${
              isActive
                ? "bg-[#f8d472] text-[#715800] rounded-full"
                : "text-slate-500"
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
            <span className="text-[10px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
