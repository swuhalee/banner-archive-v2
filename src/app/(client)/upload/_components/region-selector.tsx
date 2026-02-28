import { getChildren, getLevelPlaceholder, getSidoNodes } from '@/src/utils/region/korea-regions';
import { useMemo } from 'react';

type RegionSelectorProps = {
    value: string;
    onChange: (regionText: string) => void;
};

const RegionSelector = ({ value, onChange }: RegionSelectorProps) => {
    const selectedPath = useMemo(() => {
        const tokens = value.split(" ").map((token) => token.trim()).filter(Boolean);
        const path: string[] = [];
        let options = getSidoNodes();

        for (const token of tokens) {
            const matched = options.find((option) => option.name === token);
            if (!matched) break;
            path.push(token);
            options = matched.children;
        }

        return path;
    }, [value]);

    const optionsByLevel = useMemo(() => {
        const levels = [getSidoNodes()];
        let depth = 1;
        while (depth <= selectedPath.length) {
            const parentPath = selectedPath.slice(0, depth);
            if (parentPath.length !== depth || parentPath.some((value) => !value)) break;
            const children = getChildren(parentPath);
            if (children.length === 0) break;
            levels.push(children);
            depth += 1;
        }
        return levels;
    }, [selectedPath]);

    function handleLevelChange(level: number, nextValue: string) {
        const nextPath = selectedPath.slice(0, level);
        if (nextValue) nextPath[level] = nextValue;
        onChange(nextPath.join(" "));
    }

    return (
        <div className="grid gap-2">
            {optionsByLevel.map((options, level) => (
                <select
                    key={level}
                    value={selectedPath[level] ?? ""}
                    onChange={(e) => handleLevelChange(level, e.target.value)}
                >
                    <option value="">{level === 0 ? "시 / 도 선택" : getLevelPlaceholder(options)}</option>
                    {options.map((option) => (
                        <option key={option.name} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            ))}
        </div>
    );
};

export default RegionSelector;
