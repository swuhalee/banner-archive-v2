'use client';

type Props = {
    imageUrl: string;
};

const AnalysisLoading = ({ imageUrl }: Props) => {
    return (
        <div className="flex flex-col items-center gap-5 py-10">
            <div
                className="relative overflow-hidden rounded-xl"
                style={{ width: '100%', maxWidth: 360 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="분석 중인 사진" className="block w-full" />
                
                <div className="scan-beam" />
            </div>

            <p className="text-sm text-(--text-muted)">사진에 현수막이 있는지 찾고 있어요...</p>
        </div>
    );
};

export default AnalysisLoading;
