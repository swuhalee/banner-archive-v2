'use client'

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import type { SummaryData } from '@/src/type/stats'

type Props = {
  data: SummaryData['topHashtags']
}

type CellProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  value?: number
  index?: number
  depth?: number
  root?: boolean
}

// 1위(진함) → 10위(연함) 순서로 색상 10단계
const COLORS = ['#111111', '#252525', '#393939', '#4d4d4d', '#616161', '#7a7a7a', '#939393', '#ababab', '#c3c3c3', '#dadada']

function TreemapCell({ x = 0, y = 0, width = 0, height = 0, name, value, index = 0 }: CellProps) {
  const bg = COLORS[index] ?? '#dadada'
  const textColor = index < 5 ? '#ffffff' : '#111111'
  const subColor = index < 5 ? 'rgba(255,255,255,0.6)' : 'rgba(17,17,17,0.5)'
  const label = name?.startsWith('#') ? name : `#${name}`
  const showCount = width > 60 && height > 28
  const showLabel = width > 30 && height > 16

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(0, width - 2)}
        height={Math.max(0, height - 2)}
        fill={bg}
        rx={4}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showCount ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(12, width / 6)}
          fill={textColor}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill={subColor}
          style={{ pointerEvents: 'none' }}
        >
          {value?.toLocaleString()}
        </text>
      )}
    </g>
  )
}

export default function HashtagTreemap({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 0', textAlign: 'center' }}>
        데이터 없음
      </div>
    )
  }

  const treeData = data.map((d) => ({
    name: d.hashtag.startsWith('#') ? d.hashtag : `#${d.hashtag}`,
    size: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <Treemap
        data={treeData}
        dataKey="size"
        aspectRatio={4 / 3}
        content={<TreemapCell />}

      >
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
          formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()}개`, '등록 수']}
        />
      </Treemap>
    </ResponsiveContainer>
  )
}
