import Link from 'next/link';

export default function Page() {
  return (
    <div style={{ paddingTop: '64px', paddingBottom: '80px' }}>

      {/* Mission statement */}
      <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
        시민 아카이브 프로젝트
      </p>

      <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 700, lineHeight: 1.15, color: 'var(--text-strong)', letterSpacing: '-0.025em' }}>
        현수막은 사라지지만,<br />기록은 남습니다
      </h1>

      <p style={{ marginTop: '24px', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-muted)' }}>
        공공장소에 걸리는 정치 현수막은 수일 만에 교체되거나 철거됩니다.
        그 안에 담긴 메시지—약속, 주장, 때로는 혐오—는 흔적 없이 사라집니다.
      </p>

      <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.8, color: 'var(--text-muted)' }}>
        우리는 그것을 기록합니다. 누가, 어디서, 무엇을 말했는지.
        시민이 직접 사진을 찍고 올리면 이 저장소가 영구히 보존합니다.
      </p>

      <div className="inline-actions" style={{ marginTop: '36px' }}>
        <Link href="/archive" className="btn btn-solid">아카이브 보기</Link>
        <Link href="/upload" className="btn btn-ghost">사진 기여하기</Link>
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '48px 0 40px' }} />

      {/* Why it matters */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '20px', letterSpacing: '-0.01em' }}>
        왜 이 일이 필요한가
      </h2>

      <div style={{ display: 'grid', gap: '18px' }}>
        <Principle
          label="투명성"
          text="정치인의 공약과 주장은 공공의 자산입니다. 현수막에 담긴 메시지를 체계적으로 수집해 누구나 검색하고 비교할 수 있게 합니다."
        />
        <Principle
          label="책임"
          text="걸었다 내린 현수막도 이곳에서는 삭제되지 않습니다. 시간이 지나도 '누가 무슨 말을 했는지' 확인할 수 있어야 민주주의가 작동합니다."
        />
        <Principle
          label="참여"
          text="전국 어디서든 시민이 직접 기여할 수 있습니다. 한 장의 사진이 이 아카이브의 밀도를 높입니다."
        />
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '48px 0 40px' }} />

      {/* How to contribute */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
        어떻게 참여하나요
      </h2>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '24px' }}>
        거리에서 현수막을 발견하면 사진을 찍어 업로드하세요.
        AI가 텍스트와 정당·주제를 자동으로 분석해 메타데이터를 생성합니다.
        별도 회원가입 없이 누구나 기여할 수 있습니다.
      </p>
      <Link href="/upload" className="btn btn-ghost" style={{ width: 'fit-content' }}>
        지금 업로드하기 →
      </Link>

      {/* Footnote */}
      <p style={{ marginTop: '56px', fontSize: '13px', lineHeight: 1.7, color: 'var(--text-muted)', borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
        이 프로젝트는 특정 정당이나 정치인을 지지하거나 반대하지 않습니다.
        공공장소에 게시된 현수막을 정치적 편향 없이 수집·보존하는 것을 유일한 목적으로 합니다.
        부적절한 콘텐츠는 신고해 주시면 검토 후 조치합니다.
      </p>

    </div>
  );
}

function Principle({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '0 20px', alignItems: 'start' }}>
      <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-strong)', paddingTop: '3px' }}>
        {label}
      </span>
      <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--text-muted)', margin: 0 }}>
        {text}
      </p>
    </div>
  );
}
