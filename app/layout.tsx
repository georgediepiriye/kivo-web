// app/layout.tsx
import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${jakarta.className} antialiased`}>
        {/* Everything inside children (like your MapPage) needs this wrapper */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
