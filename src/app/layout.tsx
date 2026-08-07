import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { AuthProvider } from "@/context/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "Life Archive",
  description: "Family legacy preservation platform",
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js');
            }
          `}
        </Script>
      </body>
    </html>
  )
}
