"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/users/profile`,
          { method: "GET", credentials: "include" },
        );

        if (response.ok) {
          router.replace("/profile");
        } else {
          // User is a guest, let them stay
          setChecking(false);
        }
      } catch (error) {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-[#715800]">
          Verifying Session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
