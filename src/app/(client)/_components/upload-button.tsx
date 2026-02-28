"use client";

import { sanitizeReturnPath } from '@/src/utils/path/path';
import Link from 'next/link'
import { usePathname } from 'next/navigation';

const UploadButton = () => {
    const pathname = usePathname(); // 현재 URL의 경로명을 읽을 수 있게 해주는 클라이언트 컴포넌트 훅
    const from = sanitizeReturnPath(pathname, "/");

    return (
        <Link
            href={`/upload?from=${encodeURIComponent(from)}`}
            className="shrink-0 rounded-md border-[1.5px] border-(--line) px-4 py-2 text-[13px] font-medium text-(--text-strong) hover:border-(--line-strong)"
        >
            업로드
        </Link>
    )
}

export default UploadButton
