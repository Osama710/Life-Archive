import type { Metadata } from "next"
import { AuthProvider } from "@/context/AuthContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "Life Archive",
  description: "Family legacy preservation platform",
  manifest: '/manifest.json',
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <script>
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js');
            }
          `}
        </script>
      </body>
    </html>
  )
}
