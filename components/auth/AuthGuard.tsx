"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`, // Use a lightweight check
          { method: "GET", credentials: "include" },
        );

        if (!response.ok) {
          // Not logged in? Kick them to login
          router.replace("/auth/signin");
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        router.replace("/auth/signin");
      }
    };

    checkSession();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#715800] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
