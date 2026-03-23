"use client"

import { useState, useMemo } from "react"
import {
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Building2,
  MapPin,
  Landmark,
  AlertTriangle,
  Wallet,
} from "lucide-react"
import type { CombinedData, DeFiProtocol, Bank } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface RankingTableProps {
  combinedData: CombinedData
  bankData: any // Assuming bankData is of any type for now, replace with actual type if known
}

type SortField = "rank" | "name" | "deposits"
type SortDirection = "asc" | "desc"
type FilterType = "defi" | "us-bank" | "ar-bank" | "cex"

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

export function RankingTable({ combinedData, bankData }: RankingTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showAll, setShowAll] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set())
  const [hasMore, setHasMore] = useState(true)
  const [displayCount, setDisplayCount] = useState(50)

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters((prev) => {
      if (prev.has(filter)) {
        prev.delete(filter)
      } else {
        prev.add(filter)
      }
      return new Set(prev)
    })
  }

  const defiCount = combinedData.entities.filter((e) => e.type === "defi" && !(e as DeFiProtocol).isCEX).length
  const cexCount = combinedData.entities.filter((e) => e.type === "defi" && (e as DeFiProtocol).isCEX).length
  const usBankCount = combinedData.entities.filter((e) => e.type === "bank" && (e as Bank).country === "US").length
  const arBankCount = combinedData.entities.filter((e) => e.type === "bank" && (e as Bank).country === "AR").length

  const filteredAndSorted = useMemo(() => {
    let data = [...combinedData.entities]

    if (activeFilters.size > 0) {
      data = data.filter((e) => {
        if (activeFilters.has("defi") && e.type === "defi" && !(e as DeFiProtocol).isCEX) {
          return true
        }
        if (activeFilters.has("cex") && e.type === "defi" && (e as DeFiProtocol).isCEX) {
          return true
        }
        if (activeFilters.has("us-bank") && e.type === "bank" && (e as Bank).country === "US") {
          return true
        }
        if (activeFilters.has("ar-bank") && e.type === "bank" && (e as Bank).country === "AR") {
          return true
        }
        return false
      })
    }

    data = data.filter((item) => {
      const name = item.type === "defi" ? (item as DeFiProtocol).name : (item as Bank).name
      const secondary = item.type === "defi" ? (item as DeFiProtocol).category : (item as Bank).holdingCompany || ""
      const location = item.type === "bank" ? (item as Bank).location || "" : ""

      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        secondary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

    data.sort((a, b) => {
      let comparison = 0
      if (sortField === "rank") {
        comparison = a.rank - b.rank
      } else if (sortField === "name") {
        const aName = a.type === "defi" ? (a as DeFiProtocol).name : (a as Bank).name
        const bName = b.type === "defi" ? (b as DeFiProtocol).name : (b as Bank).name
        comparison = aName.localeCompare(bName)
      } else if (sortField === "deposits") {
        const aValue = a.type === "defi" ? (a as DeFiProtocol).totalDeposits / 1e6 : (a as Bank).consolidatedAssets
        const bValue = b.type === "defi" ? (b as DeFiProtocol).totalDeposits / 1e6 : (b as Bank).consolidatedAssets
        comparison = bValue - aValue
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return data
  }, [combinedData.entities, searchQuery, sortField, sortDirection, activeFilters])

  const displayedData = showAll ? filteredAndSorted : filteredAndSorted.slice(0, displayCount)

  const displayedDataWithDynamicRank = displayedData.map((entity, index) => ({
    ...entity,
    displayRank: index + 1,
  }))

  const formatNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toFixed(0)}`
  }

  const formatDetailNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection(field === "rank" ? "asc" : "desc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const loadMore = () => {
    if (displayedData.length < filteredAndSorted.length) {
      setDisplayCount((prev) => prev + 50)
    } else {
      setHasMore(false)
    }
  }

  return (
    <TooltipProvider>
      <section id="table-section" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Filter bar */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setActiveFilters(new Set())}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                  activeFilters.size === 0
                    ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                    : "bg-card hover:bg-card/80 text-muted-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => toggleFilter("defi")}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilters.has("defi")
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeFilters.has("defi") && <Check className="w-3 h-3" />}
                DeFi ({defiCount})
              </button>
              <button
                onClick={() => toggleFilter("cex")}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilters.has("cex")
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeFilters.has("cex") && <Check className="w-3 h-3" />}
                <AlertCircle className="w-3 h-3" />
                CEX ({cexCount})
              </button>
              <button
                onClick={() => toggleFilter("us-bank")}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilters.has("us-bank")
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeFilters.has("us-bank") && <Check className="w-3 h-3" />}
                <USFlag className="w-4 h-3 md:w-5 md:h-4" />
                US Banks ({usBankCount})
              </button>
              <button
                onClick={() => toggleFilter("ar-bank")}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFilters.has("ar-bank")
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeFilters.has("ar-bank") && <Check className="w-3 h-3" />}
                <ARFlag className="w-4 h-3 md:w-5 md:h-4" />
                AR Banks ({arBankCount})
              </button>
            </div>

            {/* Search input */}
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>

          {/* Table */}
          <div className="-mx-4 md:mx-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-none md:rounded-lg border-x-0 md:border-x border-y border-border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-card/50">
                        <th
                          className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold cursor-pointer hover:bg-card/80 transition-colors whitespace-nowrap"
                          onClick={() => handleSort("rank")}
                        >
                          <div className="flex items-center gap-1">
                            Rank <SortIcon field="rank" />
                          </div>
                        </th>
                        <th
                          className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold cursor-pointer hover:bg-card/80 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-1">
                            Name <SortIcon field="name" />
                          </div>
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold whitespace-nowrap">
                          Type
                        </th>
                        <th
                          className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-semibold cursor-pointer hover:bg-card/80 transition-colors whitespace-nowrap"
                          onClick={() => handleSort("deposits")}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span className="hidden sm:inline">Assets</span>
                            <span className="sm:hidden">Assets</span>
                            <SortIcon field="deposits" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
                      {displayedDataWithDynamicRank.map((entity) => {
                        const isDefi = entity.type === "defi"
                        const protocol = isDefi ? (entity as DeFiProtocol) : null
                        const bank = !isDefi ? (entity as Bank) : null

                        const value = isDefi ? protocol!.totalDeposits : bank!.consolidatedAssets * 1e6

                        return (
                          <tr
                            key={`${entity.type}-${isDefi ? protocol!.slug : bank!.name}`}
                            className={`hover:bg-card/30 transition-colors ${
                              protocol?.isCEX ? "bg-amber-500/5" : isDefi ? "bg-purple-500/5" : ""
                            }`}
                          >
                            <td className="px-3 md:px-4 py-3 text-xs md:text-sm whitespace-nowrap">
                              <span className="font-mono text-muted-foreground">#{entity.displayRank}</span>
                            </td>
                            <td className="px-3 md:px-4 py-3">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex items-center gap-2 md:gap-3 cursor-pointer min-w-0">
                                    {isDefi && protocol?.logo && (
                                      <img
                                        src={protocol.logo || "/placeholder.svg"}
                                        alt={protocol.name}
                                        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none"
                                        }}
                                      />
                                    )}
                                    {!isDefi && (
                                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        {bank?.country === "US" ? (
                                          <USFlag className="w-4 h-3 md:w-5 md:h-4" />
                                        ) : (
                                          <ARFlag className="w-4 h-3 md:w-5 md:h-4" />
                                        )}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-medium text-xs md:text-sm truncate">{entity.name}</div>
                                      {isDefi && protocol?.category && (
                                        <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                                          {protocol.category}
                                        </div>
                                      )}
                                      {!isDefi && bank?.location && (
                                        <div className="text-[10px] md:text-xs text-muted-foreground truncate">
                                          {bank.location}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80" align="start">
                                  {isDefi && protocol ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        {protocol.logo && (
                                          <img
                                            src={protocol.logo || "/placeholder.svg"}
                                            alt={protocol.name}
                                            className="w-10 h-10 rounded-full"
                                            onError={(e) => {
                                              e.currentTarget.style.display = "none"
                                            }}
                                          />
                                        )}
                                        <div>
                                          <h4 className="font-semibold">{protocol.name}</h4>
                                          <p className="text-sm text-muted-foreground">{protocol.category}</p>
                                        </div>
                                      </div>
                                      {protocol.versions && protocol.versions.length > 1 && (
                                        <div className="bg-muted/50 rounded p-2">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Consolidated Versions ({protocol.versions.length})
                                          </p>
                                          <p className="text-xs">{protocol.versions.join(", ")}</p>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-muted/50 rounded p-2">
                                          <p className="text-muted-foreground text-xs">TVL</p>
                                          <p className="font-mono font-medium">{formatDetailNumber(protocol.tvl)}</p>
                                        </div>
                                        {protocol.category === "Lending" && protocol.borrowed > 0 && (
                                          <div className="bg-muted/50 rounded p-2">
                                            <p className="text-muted-foreground text-xs">Borrowed</p>
                                            <p className="font-mono font-medium">
                                              {formatDetailNumber(protocol.borrowed)}
                                            </p>
                                          </div>
                                        )}
                                        {protocol.staking && protocol.staking > 0 && (
                                          <div className="bg-muted/50 rounded p-2">
                                            <p className="text-muted-foreground text-xs">Staking</p>
                                            <p className="font-mono font-medium">
                                              {formatDetailNumber(protocol.staking)}
                                            </p>
                                          </div>
                                        )}
                                        <div className="bg-muted/50 rounded p-2">
                                          <p className="text-muted-foreground text-xs">
                                            {protocol.metricLabel || "Total Deposits"}
                                          </p>
                                          <p className="font-mono font-medium">
                                            {formatDetailNumber(protocol.totalDeposits)}
                                          </p>
                                        </div>
                                      </div>
                                      {protocol.chains && protocol.chains.length > 0 && (
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">Chains</p>
                                          <div className="flex flex-wrap gap-1">
                                            {protocol.chains.slice(0, 5).map((chain) => (
                                              <span key={chain} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                {chain}
                                              </span>
                                            ))}
                                            {protocol.chains.length > 5 && (
                                              <span className="text-xs text-muted-foreground">
                                                +{protocol.chains.length - 5} more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : bank ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                          {bank.country === "US" ? (
                                            <USFlag className="w-6 h-5" />
                                          ) : (
                                            <ARFlag className="w-6 h-5" />
                                          )}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">{bank.name}</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {bank.country === "US"
                                              ? "US Commercial Bank"
                                              : "Argentine Financial Institution"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-muted/50 rounded p-2">
                                          <p className="text-muted-foreground text-xs">Consolidated Assets</p>
                                          <p className="font-mono font-medium">
                                            {formatDetailNumber(bank.consolidatedAssets * 1e6)}
                                          </p>
                                        </div>
                                        {bank.country === "US" && (
                                          <div className="bg-muted/50 rounded p-2">
                                            <p className="text-muted-foreground text-xs">Domestic Assets</p>
                                            <p className="font-mono font-medium">
                                              {formatDetailNumber(bank.domesticAssets * 1e6)}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      {bank.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <MapPin className="w-4 h-4" />
                                          <span>{bank.location}</span>
                                        </div>
                                      )}
                                      {bank.holdingCompany && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Building2 className="w-4 h-4" />
                                          <span>{bank.holdingCompany}</span>
                                        </div>
                                      )}
                                      {bank.charter && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Landmark className="w-4 h-4" />
                                          <span>Charter: {bank.charter}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </HoverCardContent>
                              </HoverCard>
                            </td>
                            <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isDefi ? (
                                  protocol?.isCEX ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] md:text-xs font-medium text-amber-300">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span className="hidden sm:inline">CEX</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] md:text-xs font-medium text-purple-300">
                                      <Wallet className="w-3 h-3" />
                                      <span className="hidden sm:inline">DeFi</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] md:text-xs font-medium">
                                    {bank?.country === "US" ? (
                                      <USFlag className="w-3 h-2.5 md:w-4 md:h-3" />
                                    ) : (
                                      <ARFlag className="w-3 h-2.5 md:w-4 md:h-3" />
                                    )}
                                    <span className="hidden sm:inline">Bank</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="font-semibold text-xs md:text-sm">
                                  $
                                  {(value / 1e9).toLocaleString(undefined, {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 2,
                                  })}
                                  B
                                </span>
                                <span className="text-[10px] md:text-xs text-muted-foreground">
                                  {isDefi ? (protocol?.isCEX ? "Onchain" : "Total Deposits") : "Consolidated Assets"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="mt-6 md:mt-8 text-center">
              <button
                onClick={loadMore}
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-card hover:bg-card/80 border border-border text-sm font-medium transition-colors"
              >
                Load More ({filteredAndSorted.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Show More/Less */}
        {filteredAndSorted.length > displayCount && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-card/80 transition-colors"
            >
              {showAll ? "Show Less" : `Show All (${filteredAndSorted.length})`}
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Showing {displayedData.length} of {filteredAndSorted.length} entities
        </div>
      </section>
    </TooltipProvider>
  )
}
