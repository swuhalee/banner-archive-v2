'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { SummaryData } from '@/src/type/stats'

type Props = {
  data: SummaryData['monthlyTrend']
}

export default function MonthlyTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
        데이터 없음
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: `${d.month.slice(5)}월`,
  }))

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={formatted} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
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
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--text-strong)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--text-strong)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--text-strong)', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
