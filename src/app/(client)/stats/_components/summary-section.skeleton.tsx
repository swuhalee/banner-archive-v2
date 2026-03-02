function Box({ w, h }: { w: string | number; h: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: 'var(--line)',
        borderRadius: 8,
        opacity: 0.6,
      }}
    />
  )
}

export default function SummarySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <Box w="60%" h={12} />
            <Box w="40%" h={24} />
          </div>
        ))}
      </div>
      <Box w="100%" h={100} />
      <Box w="100%" h={120} />
      <Box w="100%" h={80} />
    </div>
  )
}
