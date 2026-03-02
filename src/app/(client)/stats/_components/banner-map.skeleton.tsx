const BannerMapSkeleton = () => {
    return (
        <div
            style={{
                height: 600,
                borderRadius: 12,
                background: 'var(--surface, #f3f3f3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--text-muted, #888)',
            }}
        >
            지도를 불러오는 중…
        </div>
    )
}

export default BannerMapSkeleton
