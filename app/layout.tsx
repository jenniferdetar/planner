import type { Metadata } from "next";
import { Geist, Geist_Mono, Indie_Flower } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const indieFlower = Indie_Flower({
  weight: "400",
  variable: "--font-indie-flower",
  subsets: ["latin"],
});

import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Opus One Planner",
  description: "Personal operations and planning hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${indieFlower.variable} antialiased bg-gray-50 font-indie`}>
        <TopNav />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
