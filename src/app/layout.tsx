import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Applyd | Job Application Tracker",
  description: "A minimalist, high-density professional dashboard to track your job applications.",
};


import { Sidebar } from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex overflow-hidden bg-slate-50/30">
        <Sidebar />
        <div className="flex-1 overflow-y-auto h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
