type Props = {
  label: string
  value: string | number
}

export default function StatCard({ label, value }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  )
}
