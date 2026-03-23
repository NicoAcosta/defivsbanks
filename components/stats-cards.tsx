"use client"

import { useEffect, useState } from "react"
import { Wallet, Building2 } from "lucide-react"
import type { CombinedData, BankData, DeFiProtocol, Bank } from "@/lib/types"

interface StatsCardsProps {
  combinedData: CombinedData
  bankData: BankData
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current * 100) / 100)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {suffix}
    </span>
  )
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

export function StatsCards({ combinedData, bankData }: StatsCardsProps) {
  const topUSBankFromBankData = bankData.banks.filter((b) => b.country === "US")[0]

  const defiProtocols = combinedData.entities.filter(
    (e) => e.type === "defi" && !(e as DeFiProtocol).isCEX,
  ) as DeFiProtocol[]

  const cexProtocols = combinedData.entities.filter(
    (e) => e.type === "defi" && (e as DeFiProtocol).isCEX,
  ) as DeFiProtocol[]

  const usBanks = combinedData.entities.filter((e) => e.type === "bank" && (e as Bank).country === "US") as Bank[]
  const arBanks = combinedData.entities.filter((e) => e.type === "bank" && (e as Bank).country === "AR") as Bank[]

  const totalDefiDeposits = defiProtocols.reduce((sum, p) => sum + p.totalDeposits, 0)
  const totalCEXDeposits = cexProtocols.reduce((sum, p) => sum + p.totalDeposits, 0)
  const totalUSBankDeposits = usBanks.reduce((sum, b) => sum + b.consolidatedAssets, 0)
  const totalARBankDeposits = arBanks.reduce((sum, b) => sum + b.consolidatedAssets, 0)

  const topDeFi = defiProtocols[0]
  const topCEX = cexProtocols[0]
  const topUSBankFromCombinedData = usBanks[0]
  const topARBank = arBanks[0]

  return (
    <section className="py-12 border-y border-border/50 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-600/20 via-fuchsia-500/15 to-cyan-400/10 border border-purple-500/30">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-purple-500/20">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">DeFi Total</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-300">
              <AnimatedNumber value={totalDefiDeposits / 1e9} prefix="$" suffix="B" />
            </div>
            {topDeFi && (
              <p className="text-xs text-muted-foreground mt-2">
                Top: {topDeFi.name} (${(topDeFi.totalDeposits / 1e9).toFixed(1)}B)
              </p>
            )}
          </div>

          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-amber-600/20 via-orange-500/15 to-yellow-400/10 border border-amber-500/30">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-amber-500/20">
                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">CEX Total</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-300">
              <AnimatedNumber value={totalCEXDeposits / 1e9} prefix="$" suffix="B" />
            </div>
            {topCEX && (
              <p className="text-xs text-muted-foreground mt-2">
                Top: {topCEX.name} (${(topCEX.totalDeposits / 1e9).toFixed(1)}B)
              </p>
            )}
          </div>

          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-600/15 to-transparent border border-blue-500/20">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/20">
                <USFlag className="w-4 h-4 md:w-5 md:h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">US Banks</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-300">
              <AnimatedNumber value={totalUSBankDeposits / 1e6} prefix="$" suffix="T" />
            </div>
            {topUSBankFromCombinedData && (
              <p className="text-xs text-muted-foreground mt-2">
                Top: {topUSBankFromCombinedData.name} ($
                {(topUSBankFromCombinedData.consolidatedAssets / 1e6).toFixed(2)}T)
              </p>
            )}
          </div>

          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-sky-600/15 to-transparent border border-sky-500/20">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-sky-500/20">
                <ARFlag className="w-4 h-4 md:w-5 md:h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">AR Banks</span>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-sky-300">
              <AnimatedNumber value={totalARBankDeposits / 1e3} prefix="$" suffix="B" />
            </div>
            {topARBank && (
              <p className="text-xs text-muted-foreground mt-2">
                Top: {topARBank.name} (${(topARBank.consolidatedAssets / 1e3).toFixed(1)}B)
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
