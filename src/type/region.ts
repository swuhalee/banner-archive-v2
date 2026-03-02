export type RegionKind = "sido" | "si" | "gun" | "gu" | "eup" | "myeon" | "dong" | "ri";

export const REGION_KIND_ORDER: RegionKind[] = ["sido", "si", "gun", "gu", "eup", "myeon", "dong", "ri"];

export const REGION_KIND_LABEL: Record<RegionKind, string> = {
  sido: "시 / 도",
  si: "시",
  gun: "군",
  gu: "구",
  eup: "읍",
  myeon: "면",
  dong: "동",
  ri: "리",
};

export type Region = {
    name: string;
    kind: RegionKind;
    lat: number;
    lng: number;
    children: Region[];
};

export type RegionData = {
  version: number
  sido: Region[]
}