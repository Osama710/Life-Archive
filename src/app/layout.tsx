import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { FamilyProvider } from "@/context/FamilyContext";
import { QueryProvider } from "@/context/QueryProvider";
import { MeshBackground } from "@/components/MeshBackground";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import "./globals.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Life Archive",
  description: "Preserve your family's story across generations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life Archive",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Life Archive" />
      </head>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <MeshBackground />
        <QueryProvider>
          <AuthProvider>
            <FamilyProvider>{children}</FamilyProvider>
          </AuthProvider>
        </QueryProvider>
        <PwaInstallPrompt />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
