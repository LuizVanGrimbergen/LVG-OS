import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { TabBar } from "@/components/layout/tab-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LVG OS",
  description: "Persoonlijke planning, doelen, reizen en groei.",
  appleWebApp: {
    capable: true,
    title: "LVG OS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <main className="mx-auto max-w-md px-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)]">
            {children}
          </main>
          <TabBar />
        </SerwistProvider>
      </body>
    </html>
  );
}
