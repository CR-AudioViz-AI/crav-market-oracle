import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Market Oracle - AI Stock Predictions",
  description: "5 AI models battle to pick the best penny stocks. Real-time predictions, paper trading, and community insights.",
  keywords: ["AI", "stock picks", "penny stocks", "trading", "predictions"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8 pt-24">
          {children}
        </main>
        <footer className="border-t border-slate-800 mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
            <p className="mb-2">
              Powered by <span className="text-brand-cyan font-semibold">CR AudioViz AI</span>
            </p>
            <p className="text-xs">
              "Your Story. Our Design" | EIN: 93-4520864
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
