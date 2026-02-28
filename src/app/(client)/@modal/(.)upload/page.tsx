'use client';

import { useRouter } from 'next/navigation';
import UploadModal from '../../upload/_components/upload-modal';

const Page = () => {
    const router = useRouter();

    return <UploadModal open={true} onClose={() => router.back()} />;
};

export default Page;
