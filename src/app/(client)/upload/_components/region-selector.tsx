'use client'

import { useEffect, useState } from 'react'
import { REGION_KIND_LABEL } from '@/src/type/region'
import type { RegionKind } from '@/src/type/region'
import type { RegionItem } from '@/src/app/api/regions/route'

type RegionSelectorProps = {
    onChange: (regionText: string) => void
}

type LevelState = {
    options: RegionItem[]
    selected: RegionItem | null
}

async function fetchChildren(parentId?: number): Promise<RegionItem[]> {
    const url = parentId != null ? `/api/regions?parentId=${parentId}` : '/api/regions'
    const res = await fetch(url)
    const json = await res.json()
    return json.data ?? []
}

function getLevelPlaceholder(options: RegionItem[], levelIndex: number): string {
    if (levelIndex === 0) return '시 / 도 선택'
    const kinds = [...new Set(options.map((o) => o.kind))]
    return kinds.map((k) => REGION_KIND_LABEL[k as RegionKind] ?? k).join(' / ') + ' 선택'
}

const RegionSelector = ({ onChange }: RegionSelectorProps) => {
    const [levels, setLevels] = useState<LevelState[]>([{ options: [], selected: null }])

    useEffect(() => {
        fetchChildren().then((options) => {
            setLevels([{ options, selected: null }])
        })
    }, [])

    async function handleSelect(levelIndex: number, selectedId: string) {
        const item = levels[levelIndex].options.find((o) => String(o.id) === selectedId) ?? null

        // 현재 레벨까지 잘라내고 선택값 반영
        const next: LevelState[] = levels
            .slice(0, levelIndex + 1)
            .map((l, i) => (i === levelIndex ? { ...l, selected: item } : l))

        if (item) {
            onChange(item.fullPath)
            const children = await fetchChildren(item.id)
            if (children.length > 0) {
                next.push({ options: children, selected: null })
            }
        } else {
            // 선택 해제 시 부모 레벨의 fullPath로 복원
            const parentItem = levelIndex > 0 ? next[levelIndex - 1]?.selected : null
            onChange(parentItem?.fullPath ?? '')
        }

        setLevels(next)
    }

    return (
        <div className="grid gap-2">
            {levels.map((level, i) => (
                <select
                    key={i}
                    value={level.selected?.id ?? ''}
                    onChange={(e) => handleSelect(i, e.target.value)}
                >
                    <option value="">{getLevelPlaceholder(level.options, i)}</option>
                    {level.options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            ))}
        </div>
    )
}

export default RegionSelector
