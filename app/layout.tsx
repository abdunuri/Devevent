import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import LightRays from "@/components/LightRays";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import PostHogProvider from "@/components/PostHogProvider";
import NavBarSlot from "@/components/NavBarSlot";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TECHVENT",
  description: "The hub for developers to share and discover events",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon.ico", type: "image/x-icon" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon.ico",
  },
  openGraph: {
    title: "TECHVENT",
    description: "The hub for developers to share and discover events",
    images: ["/icons/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TECHVENT",
    description: "The hub for developers to share and discover events",
    images: ["/icons/logo.png"],
  },
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", spaceGrotesk.variable, jetBrainsMono.variable)}>
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
