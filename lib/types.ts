export interface Bank {
  rank: number
  name: string
  holdingCompany?: string
  location?: string
  charter?: string
  consolidatedAssets: number // in millions USD
  domesticAssets: number
  type: "bank"
  country: "US" | "AR"
}

export interface DeFiProtocol {
  rank: number
  name: string
  slug: string
  symbol?: string
  category: string
  tvl: number // in USD - raw DeFiLlama TVL
  borrowed: number // in USD - borrowed amount for lending protocols
  totalDeposits: number // computed comparable metric value
  metricLabel: string // explains what totalDeposits represents
  metricNotes: string[] // explanations for metric computation
  isBankComparable: boolean // whether to include in bank rankings
  chains: string[]
  logo?: string
  type: "defi"
  isCEX?: boolean // Centralized exchange flag
  versions?: string[] // Track consolidated versions
  staking?: number // optional staking component
  pool2?: number // optional pool2 component
}

export type RankedEntity = (Bank | DeFiProtocol) & { originalRank?: number }

export interface ProtocolData {
  protocols: DeFiProtocol[]
  totalProtocols: number
  totalTvl: number
  lastUpdated: string
}

export interface BankData {
  banks: Bank[]
  lastUpdated: string
  totalBanks: number
  usBanks: number
  arBanks: number
}

export interface CombinedData {
  entities: RankedEntity[]
  protocolCount: number
  bankCount: number
  usBankCount: number
  arBankCount: number
  cexCount: number
  totalDefiDeposits: number
  topProtocol?: DeFiProtocol
  lastUpdated: string
  arsUsdRate?: number
}

export interface ComparableMetric {
  metricValue: number
  metricLabel: string
  components: {
    tvl: number
    borrowed?: number
    staking?: number
    pool2?: number
  }
  notes: string[]
  isBankComparable: boolean
}
