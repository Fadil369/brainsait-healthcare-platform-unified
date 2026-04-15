import "@/styles/globals.css";
import type { Metadata } from "next";
import SkipLink from "@/components/SkipLink";
import ToastProvider from "@/components/ToastProvider";
import MeshBackground from "@/components/MeshBackground";

// Use system fonts as fallback. Google Fonts are loaded via CSS @import in globals.css
// This approach ensures builds succeed even in restricted network environments
const fontClassName = "font-sans";

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
}>): React.ReactElement {
  return (
    <html lang="en" className={fontClassName}>
      <head>
        {/* Load Google Fonts via link tags for better build compatibility */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
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
