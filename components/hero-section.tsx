"use client"

import { useEffect, useState } from "react"
import { ArrowDown, Zap } from "lucide-react"
import type { CombinedData } from "@/lib/types"

interface HeroSectionProps {
  combinedData: CombinedData
}

function USFlag({ className = "w-5 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" rx="1" fill="#B22234" />
      <rect y="1.08" width="20" height="1.08" fill="white" />
      <rect y="3.23" width="20" height="1.08" fill="white" />
      <rect y="5.38" width="20" height="1.08" fill="white" />
      <rect y="7.54" width="20" height="1.08" fill="white" />
      <rect y="9.69" width="20" height="1.08" fill="white" />
      <rect y="11.85" width="20" height="1.08" fill="white" />
      <rect width="8" height="7.54" fill="#3C3B6E" />
    </svg>
  )
}

function ARFlag({ className = "w-5 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" rx="1" fill="white" />
      <rect width="20" height="4.67" fill="#74ACDF" />
      <rect y="9.33" width="20" height="4.67" fill="#74ACDF" />
      <circle cx="10" cy="7" r="2" fill="#F6B40E" />
    </svg>
  )
}

export function HeroSection({ combinedData }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const formatDeposits = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    return `$${(value / 1e9).toFixed(1)}B`
  }

  return (
    <section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/8 via-fuchsia-500/4 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {/* Data source badge */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 md:mb-6">
            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-400 flex-shrink-0" />
            <span className="text-[10px] md:text-xs font-medium text-purple-300">
              DeFiLlama • Federal Reserve • BCRA
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 md:mb-4 text-balance px-4">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              DeFi vs Banks
            </span>{" "}
            <span className="text-foreground">Global Finance Comparison</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto mb-6 md:mb-8 text-pretty px-4">
            Compare decentralized finance protocols with traditional banks worldwide
          </p>

          {/* CTA button */}
          <button
            onClick={() => {
              document.getElementById("table-section")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm md:text-base font-medium hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            View Rankings
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
