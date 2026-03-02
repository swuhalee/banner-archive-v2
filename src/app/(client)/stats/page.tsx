import SummarySection from './_components/summary-section'
import BannerMap from './_components/banner-map.client'

export default function StatsPage() {
  return (
    <div className="stack-lg">
      <SummarySection scope={null} />

      <BannerMap />
    </div>
  )
}
