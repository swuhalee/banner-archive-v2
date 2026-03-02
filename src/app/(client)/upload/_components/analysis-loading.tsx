type Props = {
  imageUrl: string;
};

const AnalysisLoading = ({ imageUrl }: Props) => {
  return (
    <div className="flex flex-col items-center gap-5 py-10">
      <div className="relative w-full max-w-90 overflow-hidden rounded-xl">
        {/*
         * Next.js Image는 Blob URL(URL.createObjectURL)을 지원하지 않아 <img>를 사용합니다.
         * @see https://nextjs.org/docs/app/api-reference/components/image#src
         */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="분석 중인 사진" className="block w-full" />
        
        {/* 사진 위를 왼쪽 -> 오른쪽으로 가로지르는 스캔 빔 애니메이션 — globals.css의 .scan-beam 클래스에 정의 */}
        <div className="scan-beam" />
      </div>

      <p className="text-sm text-(--text-muted)">사진에 현수막이 있는지 찾고 있어요...</p>
    </div>
  );
};

export default AnalysisLoading;
