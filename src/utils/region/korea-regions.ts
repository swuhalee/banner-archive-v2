import { Region, REGION_KIND_LABEL, REGION_KIND_ORDER, RegionData } from "@/src/type/region";
import data from "./korea-regions-with-coords.json";

const regions = data as RegionData;

export function getSidoNodes(): Region[] {
  return regions.sido;
}

export function getSidoList(): string[] {
  return regions.sido.map((node) => node.name);
}

export function getChildren(path: string[]): Region[] {
  let currentLevel = regions.sido;

  for (const segment of path) {
    const matched = currentLevel.find((node) => node.name === segment);
    if (!matched) return [];
    currentLevel = matched.children;
  }

  return currentLevel;
}

export function getChildrenNames(path: string[]): string[] {
  return getChildren(path).map((node) => node.name);
}

export function getLevelPlaceholder(options: Region[]): string {
  if (options.length === 0) return "행정구역 선택";

  const uniqueKinds = [...new Set(options.map((option) => option.kind))].sort(
    (a, b) => REGION_KIND_ORDER.indexOf(a) - REGION_KIND_ORDER.indexOf(b),
  );
  const labels = uniqueKinds.map((kind) => REGION_KIND_LABEL[kind]);

  return `${labels.join(" / ")} 선택`;
}
