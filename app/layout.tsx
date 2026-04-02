import type { Metadata } from "next";
import { Suspense } from "react";
import LightRays from "@/components/LightRays";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import PostHogProvider from "@/components/PostHogProvider";
import NavBarSlot from "@/components/NavBarSlot";

export const metadata: Metadata = {
  title: "TECHVENT",
  description: "The hub for developers to share and discover events",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col min-h-screen">
      <PostHogProvider>
        <Suspense fallback={<NavBar />}>
          <NavBarSlot />
        </Suspense>
      <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
        <LightRays
            raysOrigin="top-center"
            raysColor="#5dfeca"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
        />
      </div>
      <main>

            {children}
      </main>
      </PostHogProvider>
      </body>
    </html>
  );
}
