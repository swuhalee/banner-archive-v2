import data from "./korea-regions.json";

export type KoreaRegionKind = "sido" | "si" | "gun" | "gu" | "eup" | "myeon" | "dong" | "ri";

export type KoreaRegionNode = {
  name: string;
  kind: KoreaRegionKind;
  children: KoreaRegionNode[];
};

export type KoreaRegionsData = {
  version: 2;
  sido: KoreaRegionNode[];
};

const KIND_ORDER: KoreaRegionKind[] = ["sido", "si", "gun", "gu", "eup", "myeon", "dong", "ri"];

const KIND_LABEL: Record<KoreaRegionKind, string> = {
  sido: "시 / 도",
  si: "시",
  gun: "군",
  gu: "구",
  eup: "읍",
  myeon: "면",
  dong: "동",
  ri: "리",
};

const regions = data as KoreaRegionsData;

export function getSidoNodes(): KoreaRegionNode[] {
  return regions.sido;
}

export function getSidoList(): string[] {
  return regions.sido.map((node) => node.name);
}

export function getChildren(path: string[]): KoreaRegionNode[] {
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

export function getLevelPlaceholder(options: KoreaRegionNode[]): string {
  if (options.length === 0) return "행정구역 선택";

  const uniqueKinds = [...new Set(options.map((option) => option.kind))].sort(
    (a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b),
  );
  const labels = uniqueKinds.map((kind) => KIND_LABEL[kind]);

  return `${labels.join(" / ")} 선택`;
}
