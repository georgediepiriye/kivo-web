import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          key="material-symbols"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${jakarta.className}`}>
        {children}
      </body>
    </html>
  );
}
