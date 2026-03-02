import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { sanitizeReturnPath } from '@/src/utils/path/path'
import type { BannerWithImage } from '@/src/type/banner'

type PhotoCardProps = {
  item: Pick<BannerWithImage, 'id' | 'regionText' | 'imageUrl'>;
  fromPath?: string;
};

const PhotoCard = ({ item, fromPath }: PhotoCardProps) => {
  const safeFrom = useMemo(() => sanitizeReturnPath(fromPath, "/"), [fromPath])

  return (
    <article className="group mb-3.5 break-inside-avoid overflow-hidden border border-(--line) bg-(--surface)">
      <Link
        href={`/banner?id=${encodeURIComponent(item.id)}&from=${encodeURIComponent(safeFrom)}`}
        className="relative block"
        aria-label={`${item.regionText} 상세 보기`}
      >
        <div className="relative w-full aspect-4/3">
          <Image
            src={item.imageUrl ?? ''}
            alt={item.regionText}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover grayscale border-b border-(--line)"
          />
        </div>
        <div
          className="absolute inset-0 bg-black/20 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          aria-hidden
        />
        <p className="absolute right-3 bottom-3 left-3 m-0 translate-y-0 text-[13px] font-semibold text-white opacity-100 transition-all duration-150 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          {item.regionText}
        </p>
      </Link>
    </article>
  )
}

export default PhotoCard
