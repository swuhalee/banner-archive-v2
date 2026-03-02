'use client'

import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { RegionLevel } from '@/src/app/api/stats/banners/route'
import { REGION_COORDS } from '@/src/utils/region/korea-coords'
import { useGetBannerStats } from '../_hooks/useGetBannerStats'

// zoom 레벨에 따른 지역 단계 결정
function resolveLevel(zoom: number): RegionLevel {
  if (zoom <= 8) return 'sido'
  if (zoom <= 11) return 'sigungu'
  return 'eupmyeondong'
}

// zoom 레벨 한국어 표시
const LEVEL_LABEL: Record<RegionLevel, string> = {
  sido: '시 / 도',
  sigungu: '시 / 군 / 구',
  eupmyeondong: '읍 / 면 / 동',
}

// 버블 반지름 계산 (px) - sqrt 스케일로 면적이 비례하도록
function bubbleRadius(count: number, maxCount: number, level: RegionLevel): number {
  const ratio = Math.sqrt(count / Math.max(maxCount, 1))
  const [minR, maxR] =
    level === 'sido' ? [12, 60] : level === 'sigungu' ? [6, 36] : [4, 20]
  return minR + (maxR - minR) * ratio
}

// 색상 (5단계 회색 계열 - 정치적 중립)
const GRAY_STEPS = ['#d4d4d4', '#a3a3a3', '#737373', '#404040', '#171717']

function bubbleColor(count: number, maxCount: number): string {
  const ratio = count / Math.max(maxCount, 1)
  const idx = Math.min(Math.floor(ratio * GRAY_STEPS.length), GRAY_STEPS.length - 1)
  return GRAY_STEPS[idx]
}

function ZoomTracker({ onChange }: { onChange: (level: RegionLevel) => void }) {
  const map = useMapEvents({
    zoomend: () => onChange(resolveLevel(map.getZoom())),
  })
  return null
}

export default function BannerMap() {
  const [level, setLevel] = useState<RegionLevel>('sido')
  const { data: stats = [], isFetching, error } = useGetBannerStats(level)
  const loading = isFetching
  const errorMessage = error instanceof Error ? error.message : null

  const maxCount = useMemo(() => Math.max(1, ...stats.map((s) => s.count)), [stats])

  // 좌표가 있는 항목만 렌더링
  const markers = useMemo(
    () =>
      stats.flatMap((stat) => {
        const coords = REGION_COORDS[stat.region]
        if (!coords) return []
        return [{ stat, coords }]
      }),
    [stats]
  )

  return (
    <div className="relative">
      {/* 상단 컨트롤 바 */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line, #e5e5e5)',
          borderRadius: 10,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-strong, #111)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#555',
            display: 'inline-block',
            opacity: loading ? 0.4 : 1,
          }}
        />
        {loading ? '로딩 중…' : `${LEVEL_LABEL[level]} 단위 · ${markers.length}개 지역`}
      </div>

      <MapContainer
        center={[36.5, 127.5]}
        zoom={7}
        minZoom={6}
        maxZoom={13}
        style={{ height: 600, width: '100%', borderRadius: 12 }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <ZoomTracker onChange={setLevel} />

        {markers.map(({ stat, coords }) => {
          const r = bubbleRadius(stat.count, maxCount, level)
          const fill = bubbleColor(stat.count, maxCount)
          return (
            <CircleMarker
              key={stat.region}
              center={coords}
              radius={r}
              pathOptions={{
                fillColor: fill,
                fillOpacity: 0.75,
                color: '#333',
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -r]} opacity={1}>
                <div style={{ fontSize: 13, fontWeight: 600, minWidth: 80 }}>
                  {stat.region}
                  <br />
                  <span style={{ fontWeight: 400 }}>현수막 </span>
                  <strong>{stat.count.toLocaleString()}개</strong>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* 에러 */}
      {errorMessage && (
        <p style={{ marginTop: 8, color: '#ef4444', fontSize: 13 }}>{errorMessage}</p>
      )}

      {/* 범례 */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 12,
          color: 'var(--text-muted, #666)',
        }}
      >
        <span>지도를 확대하면 더 세밀한 단위로 전환됩니다.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="60" height="12" viewBox="0 0 60 12">
            {GRAY_STEPS.map((fill, i) => (
              <circle key={i} cx={6 + i * 12} cy="6" r="5" fill={fill} stroke="#555" strokeWidth="0.8" />
            ))}
          </svg>
          적음 → 많음
        </span>
      </div>
    </div>
  )
}
