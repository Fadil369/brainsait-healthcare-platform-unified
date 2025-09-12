import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import SkipLink from "@/components/SkipLink";
import ToastProvider from "@/components/ToastProvider";
import MeshBackground from "@/components/MeshBackground";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const plexArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ["arabic"], 
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "BrainSAIT Unified Healthcare Platform",
  description:
    "AI-Powered Healthcare with NPHIES/FHIR Integration, Saudi Market Support, and Advanced Analytics",
  keywords: [
    "healthcare",
    "ai",
    "nphies",
    "fhir",
    "hipaa",
    "saudi-arabia",
    "medical-imaging",
    "transcription",
    "brainsait",
  ],
  authors: [{ name: "BrainSAIT Healthcare Team" }],
  robots: "index, follow",
  openGraph: {
    title: "BrainSAIT Unified Healthcare Platform",
    description:
      "Advanced AI-powered healthcare platform with comprehensive NPHIES/FHIR integration",
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainSAIT Healthcare Platform",
    description: "AI-powered healthcare with Saudi market integration",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} ${plexArabic.className} font-sans`}>
      <head />
      <body className="font-sans antialiased">
        <ToastProvider>
          <MeshBackground className="fixed inset-0 -z-10" />
          <SkipLink />
          <main id="main-content" role="main">
            <div id="root">{children}</div>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
