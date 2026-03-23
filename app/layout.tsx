import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFi vs Banks",
  description:
    "Compare decentralized finance protocols with traditional banks worldwide. Live data from DeFiLlama, Federal Reserve, and BCRA.",
  keywords: [
    "DeFi",
    "Banks",
    "TVL",
    "Cryptocurrency",
    "Finance",
    "DeFi Protocols",
    "CEX",
    "Traditional Banking",
    "Comparison",
  ],
  generator: "v0.app",
  authors: [{ name: "nicoacosta.eth", url: "https://x.com/0xnico_" }],
  creator: "nicoacosta.eth",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://defivsbanks.com",
    title: "DeFi vs Banks",
    description:
      "Compare decentralized finance protocols with traditional banks worldwide. Live data from DeFiLlama, Federal Reserve, and BCRA.",
    siteName: "DeFi vs Banks",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DeFi vs Banks - Global Finance Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeFi vs Banks",
    description:
      "Compare decentralized finance protocols with traditional banks worldwide. Live data from DeFiLlama, Federal Reserve, and BCRA.",
    creator: "@0xnico_",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1625",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased min-h-screen`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
