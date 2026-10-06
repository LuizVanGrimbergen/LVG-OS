import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { AppMenu } from "@/components/layout/app-menu";
import { OfflineSync } from "@/features/offline/components/offline-sync";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ReflectionProvider } from "@/features/reflection/reflection-context";
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
  description: "Personal goals, habits and growth.",
  appleWebApp: {
    capable: true,
    title: "LVG OS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1420",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <MotionProvider>
            <ReflectionProvider>
              <main className="mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)]">
                {children}
              </main>
            </ReflectionProvider>
            <AppMenu />
            <OfflineSync />
          </MotionProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
