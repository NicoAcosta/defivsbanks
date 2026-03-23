"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronUp, Building2 } from "lucide-react"
import type { AaveData, BankData, Bank } from "@/lib/types"
import { Input } from "@/components/ui/input"

interface BankTableProps {
  aaveData: AaveData
  bankData: BankData
}

type SortField = "rank" | "name" | "assets"
type SortDirection = "asc" | "desc"

export function BankTable({ aaveData, bankData }: BankTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showAll, setShowAll] = useState(false)

  // Combine Aave with banks and sort
  const combinedData = useMemo(() => {
    const aaveEntry: Bank & { isAave: boolean } = {
      rank: aaveData.rank,
      name: "AAVE PROTOCOL",
      holdingCompany: "DECENTRALIZED",
      location: "ETHEREUM",
      charter: "DEFI",
      consolidatedAssets: aaveData.totalDeposits / 1e6, // Convert to millions
      domesticAssets: aaveData.totalDeposits / 1e6,
      isAave: true,
    }

    const banksWithAave = [
      ...bankData.banks.slice(0, aaveData.rank - 1).map((b) => ({ ...b, isAave: false })),
      aaveEntry,
      ...bankData.banks.slice(aaveData.rank - 1).map((b) => ({ ...b, rank: b.rank + 1, isAave: false })),
    ]

    // Filter by search
    const filtered = banksWithAave.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.holdingCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
    )

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "rank":
          comparison = a.rank - b.rank
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "assets":
          comparison = a.consolidatedAssets - b.consolidatedAssets
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [aaveData, bankData, searchQuery, sortField, sortDirection])

  const displayData = showAll ? combinedData : combinedData.slice(0, 50)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const formatAssets = (millions: number) => {
    if (millions >= 1000000) {
      return `$${(millions / 1000000).toFixed(2)}T`
    }
    if (millions >= 1000) {
      return `$${(millions / 1000).toFixed(2)}B`
    }
    return `$${millions.toFixed(0)}M`
  }

  return (
    <section id="table-section" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bank Rankings</h2>
            <p className="text-muted-foreground">
              U.S. commercial banks ranked by consolidated assets, with Aave total deposits for comparison
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search banks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("rank")}
                  >
                    <div className="flex items-center gap-2">
                      Rank
                      <SortIcon field="rank" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Location
                  </th>
                  <th
                    className="px-6 py-4 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("assets")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Deposits
                      <SortIcon field="assets" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayData.map((item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    className={`
                      transition-colors hover:bg-secondary/30
                      ${item.isAave ? "bg-gradient-to-r from-purple-600/15 via-fuchsia-500/10 to-cyan-400/5" : ""}
                    `}
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`font-mono text-sm ${item.isAave ? "text-purple-400 font-bold" : "text-muted-foreground"}`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.isAave ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
                              <path d="M20 8L8 20L20 32L32 20L20 8Z" fill="white" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className={`font-medium ${item.isAave ? "text-purple-300" : ""}`}>
                            {item.isAave ? "Aave Protocol" : item.name}
                          </div>
                          {item.holdingCompany && (
                            <div className="text-sm text-muted-foreground">
                              {item.isAave ? "DeFi Lending Protocol" : item.holdingCompany}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                      {item.isAave ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-medium">
                          Multi-Chain
                        </span>
                      ) : (
                        item.location
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono ${item.isAave ? "text-purple-300 font-bold" : ""}`}>
                        {formatAssets(item.consolidatedAssets)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {combinedData.length > 50 && !showAll && (
            <div className="p-4 text-center border-t border-border">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-colors"
              >
                Show all {combinedData.length} banks
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Data sources: Federal Reserve Large Commercial Banks Report & DeFiLlama. Last updated:{" "}
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </section>
  )
}
