import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsCards } from "@/components/stats-cards"
import { RankingTable } from "@/components/ranking-table"
import { Footer } from "@/components/footer"
import { LoadingTable } from "@/components/loading-table"
import { fetchProtocolsData, fetchBankData, combineAndRankEntities, fetchArsUsdRate } from "@/lib/data-fetcher"

export const revalidate = 3600

export default async function HomePage() {
  const arsUsdRate = await fetchArsUsdRate()

  const [protocolData, bankData] = await Promise.all([fetchProtocolsData(), fetchBankData(arsUsdRate)])

  const combinedData = combineAndRankEntities(protocolData.protocols, bankData.banks)
  combinedData.arsUsdRate = arsUsdRate

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection combinedData={combinedData} />
        <StatsCards combinedData={combinedData} bankData={bankData} />
        <Suspense fallback={<LoadingTable />}>
          <RankingTable combinedData={combinedData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
