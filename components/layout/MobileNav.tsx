"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Layers, Cpu } from "lucide-react"; // install lucide-react: npm i lucide-react

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Discover", href: "/map", icon: Compass },
    { name: "Create", href: "/create", icon: PlusCircle },
    { name: "Feed", href: "/feed", icon: Layers },
    { name: "AI", href: "/ai", icon: Cpu },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 
      bg-[#f5f6f7]/80 backdrop-blur-2xl rounded-t-[1.5rem] md:hidden"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

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
            <IconComponent
              size={24}
              className={`mb-1 ${isActive ? "fill-current" : ""}`}
            />
            <span className="text-[10px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
