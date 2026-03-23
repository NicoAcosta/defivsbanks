import type { DeFiProtocol, BankData, Bank, ProtocolData, CombinedData, ComparableMetric } from "./types"
import { US_BANKS } from "./us-banks-data"
import { AR_BANKS_ARS } from "./ar-banks-data"

export async function fetchArsUsdRate(): Promise<number> {
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch ARS/USD rate")
    }

    const data = await response.json()
    return data.venta || 1200
  } catch (error) {
    console.error("Error fetching ARS/USD rate:", error)
    return 1200
  }
}

const CEX_SLUGS = new Set([
  "binance-cex",
  "okx",
  "bybit",
  "bitfinex",
  "crypto-com",
  "htx",
  "kucoin",
  "kraken",
  "gate-io",
  "coinbase",
  "bitget",
  "mexc",
  "bitstamp",
  "gemini",
  "upbit",
  "bithumb",
  "bitflyer",
  "deribit",
  "robinhood",
])

const BRIDGE_CATEGORIES = new Set(["Bridge", "Cross Chain", "Wrapped"])

const BRIDGE_NAME_PATTERNS = [
  /^W?BTC$/i,
  /wrapped/i,
  /bridge/i,
  /^portal/i,
  /^multichain/i,
  /^wormhole/i,
  /^layerzero/i,
  /^stargate/i,
]

const DERIVATIVES_CATEGORIES = new Set(["Derivatives", "Perpetuals", "Options"])

function computeComparableMetric(protocol: {
  name: string
  category: string
  tvl: number
  borrowed?: number
  staking?: number
  pool2?: number
  chainTvls?: Record<string, number>
}): ComparableMetric {
  const { name, category, tvl, borrowed, staking } = protocol

  const components: ComparableMetric["components"] = { tvl }
  if (borrowed !== undefined && borrowed > 0) components.borrowed = borrowed
  if (staking !== undefined && staking > 0) components.staking = staking

  const notes: string[] = []

  const isLending = category === "Lending" || (borrowed !== undefined && borrowed > 0)

  const isCEX = category === "CEX"

  const isBridge = BRIDGE_CATEGORIES.has(category) || BRIDGE_NAME_PATTERNS.some((p) => p.test(name))

  const isDerivatives = DERIVATIVES_CATEGORIES.has(category)

  const isStaking = category === "Liquid Staking" || category === "Restaking"

  if (isLending) {
    const borrowedValue = borrowed ?? tvl * 1.6
    const metricValue = tvl + borrowedValue

    if (borrowed === undefined) {
      notes.push("Borrowed estimated as 1.6x TVL (typical lending ratio).")
    }

    return {
      metricValue,
      metricLabel: "Gross Deposits (TVL + Borrowed)",
      components,
      notes,
      isBankComparable: true,
    }
  }

  if (isCEX) {
    return {
      metricValue: tvl,
      metricLabel: "Onchain Reserves",
      components,
      notes: ["CEX reserves shown; actual custody may differ."],
      isBankComparable: true,
    }
  }

  if (isBridge) {
    return {
      metricValue: tvl,
      metricLabel: "Locked Assets",
      components,
      notes: ["Bridge TVL represents locked/wrapped assets."],
      isBankComparable: false,
    }
  }

  if (isDerivatives) {
    return {
      metricValue: tvl,
      metricLabel: "Collateral TVL",
      components,
      notes: ["Derivatives TVL represents collateral, not deposits."],
      isBankComparable: false,
    }
  }

  if (isStaking) {
    const stakingValue = staking ?? 0
    return {
      metricValue: tvl + stakingValue,
      metricLabel: "Staked Assets",
      components,
      notes: ["Liquid staking TVL represents staked assets."],
      isBankComparable: true,
    }
  }

  return {
    metricValue: tvl,
    metricLabel: "TVL",
    components,
    notes,
    isBankComparable: true,
  }
}

function getBaseProtocolName(name: string): string {
  return name
    .replace(/\s+V\d+$/i, "")
    .replace(/\s+v\d+$/i, "")
    .replace(/\s+\d+$/i, "")
    .replace(/\s+Classic$/i, "")
    .replace(/\s+Legacy$/i, "")
    .trim()
}

export async function fetchProtocolsData(): Promise<ProtocolData> {
  try {
    const response = await fetch("https://api.llama.fi/protocols", {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch protocols")
    }

    const data = await response.json()
    const protocolMap = new Map<string, DeFiProtocol>()

    for (const p of data) {
      if (!p.tvl || p.tvl <= 0) continue

      const baseName = getBaseProtocolName(p.name)
      const isCEX = CEX_SLUGS.has(p.slug) || p.category === "CEX"

      const borrowed = p.chainTvls?.borrowed || 0

      const metric = computeComparableMetric({
        name: p.name,
        category: p.category,
        tvl: p.tvl,
        borrowed,
        staking: p.staking,
        pool2: p.pool2,
        chainTvls: p.chainTvls,
      })

      const protocol: DeFiProtocol = {
        rank: 0,
        name: p.name,
        slug: p.slug,
        symbol: p.symbol,
        category: p.category,
        tvl: p.tvl,
        borrowed,
        totalDeposits: metric.metricValue,
        metricLabel: metric.metricLabel,
        metricNotes: metric.notes,
        isBankComparable: metric.isBankComparable,
        chains: p.chains || [],
        logo: p.logo,
        type: "defi",
        isCEX,
        staking: p.staking,
        pool2: p.pool2,
      }

      if (protocolMap.has(baseName)) {
        const existing = protocolMap.get(baseName)!
        existing.tvl += protocol.tvl
        existing.borrowed += protocol.borrowed
        if (protocol.staking) existing.staking = (existing.staking || 0) + protocol.staking
        if (protocol.pool2) existing.pool2 = (existing.pool2 || 0) + protocol.pool2

        const recalculatedMetric = computeComparableMetric({
          name: existing.name,
          category: existing.category,
          tvl: existing.tvl,
          borrowed: existing.borrowed,
          staking: existing.staking,
          pool2: existing.pool2,
        })
        existing.totalDeposits = recalculatedMetric.metricValue
        existing.metricLabel = recalculatedMetric.metricLabel
        existing.metricNotes = recalculatedMetric.notes

        existing.versions = existing.versions || [existing.name]
        existing.versions.push(protocol.name)
        existing.name = baseName
      } else {
        protocol.name = baseName
        protocolMap.set(baseName, protocol)
      }
    }

    const protocols = Array.from(protocolMap.values())
      .sort((a, b) => b.totalDeposits - a.totalDeposits)
      .slice(0, 200)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    const totalTvl = protocols.reduce((sum, p) => sum + p.tvl, 0)

    return {
      protocols,
      totalProtocols: protocols.length,
      totalTvl,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching protocols:", error)
    return {
      protocols: [],
      totalProtocols: 0,
      totalTvl: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

export async function getArgentineBanks(arsUsdRate: number): Promise<Bank[]> {
  return AR_BANKS_ARS.map((bank) => {
    const assetsUsdMillions = (bank.assetsArsThousands * 1000) / arsUsdRate / 1e6
    return {
      rank: bank.rank,
      name: bank.name,
      location: "Argentina",
      consolidatedAssets: assetsUsdMillions,
      domesticAssets: assetsUsdMillions * 0.95,
      holdingCompany: "BCRA Regulated",
      country: "AR" as const,
      type: "bank" as const,
    }
  })
}

export async function fetchBankData(arsUsdRate = 1200): Promise<BankData> {
  const argentinaBanks = await getArgentineBanks(arsUsdRate)
  const allBanks = [...US_BANKS, ...argentinaBanks]

  return {
    banks: allBanks,
    lastUpdated: new Date().toISOString(),
    totalBanks: allBanks.length,
    usBanks: US_BANKS.length,
    arBanks: argentinaBanks.length,
  }
}

export function combineAndRankEntities(protocols: DeFiProtocol[], banks: Bank[]): CombinedData {
  const allEntities = [
    ...protocols.map((p) => ({
      ...p,
      consolidatedAssets: p.totalDeposits / 1e6,
      originalRank: p.rank,
    })),
    ...banks.map((b) => ({
      ...b,
      originalRank: b.rank,
    })),
  ]

  allEntities.sort((a, b) => {
    const aValue = a.type === "defi" ? (a as DeFiProtocol).totalDeposits / 1e6 : (a as Bank).consolidatedAssets
    const bValue = b.type === "defi" ? (b as DeFiProtocol).totalDeposits / 1e6 : (b as Bank).consolidatedAssets
    return bValue - aValue
  })

  allEntities.forEach((entity, index) => {
    entity.rank = index + 1
  })

  const defiProtocols = protocols.filter((p) => !p.isCEX)
  const cexProtocols = protocols.filter((p) => p.isCEX)
  const usBanks = banks.filter((b) => b.country === "US")
  const arBanks = banks.filter((b) => b.country === "AR")

  const totalDefiDeposits = defiProtocols.reduce((sum, p) => sum + p.totalDeposits, 0)
  const topProtocol =
    defiProtocols.length > 0
      ? defiProtocols.reduce((max, p) => (p.totalDeposits > max.totalDeposits ? p : max))
      : undefined

  return {
    entities: allEntities,
    protocolCount: defiProtocols.length,
    bankCount: banks.length,
    usBankCount: usBanks.length,
    arBankCount: arBanks.length,
    cexCount: cexProtocols.length,
    totalDefiDeposits,
    topProtocol,
    lastUpdated: new Date().toISOString(),
  }
}
