import BannerMap from './_components/banner-map.client'

export default function Page() {
  return (
    <div className="stack-lg">
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>지역별 현수막 현황</h1>
      <BannerMap />
    </div>
  )
}
