'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { SummaryData } from '@/src/type/stats'
import { SUBJECT_TYPE_LABEL } from '@/src/type/banner'

type Props = {
  data: SummaryData['subjectTypeDist']
}

const ORDER = Object.keys(SUBJECT_TYPE_LABEL)
const COLORS = ['#111111', '#666666', '#bbbbbb']

export default function SubjectDist({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 0', textAlign: 'center' }}>
        데이터 없음
      </div>
    )
  }

  const sorted = [...data].sort(
    (a, b) => ORDER.indexOf(a.type ?? 'other') - ORDER.indexOf(b.type ?? 'other'),
  )

  const pieData = sorted.map((d) => ({
    name: SUBJECT_TYPE_LABEL[d.type ?? 'other'] ?? d.type ?? '기타',
    value: d.count,
    pct: Math.round((d.count / total) * 100),
  }))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={32}
            outerRadius={54}
            dataKey="value"
            strokeWidth={2}
            stroke="#ffffff"
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i] ?? '#bbbbbb'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toLocaleString()}개`, '']}
          />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pieData.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: COLORS[i] ?? '#bbbbbb',
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{d.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
