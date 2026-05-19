import type { Metadata, Viewport } from "next";
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
  title: "Emirates Flight Tracker",
  description:
    "Real-time Emirates flight tracking, fleet information, and flight search — live from OpenSky Network",
  keywords: [
    "Emirates",
    "flight tracker",
    "real-time",
    "aviation",
    "Dubai",
    "A380",
    "Boeing",
    "777",
    "flight status",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈️</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#D71921",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-zinc-50 dark:bg-[#0F0F1A]">
        {children}
      </body>
    </html>
  );
}
