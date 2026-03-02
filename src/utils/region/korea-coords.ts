import { Region, RegionData } from '@/src/type/region'
import data from './korea-regions-with-coords.json'

// 트리를 순회하며 "경로 → [lat, lng]" 플랫 맵 구성
function buildCoordsMap(
  nodes: Region[],
  pathPrefix: string,
  out: Record<string, [number, number]>
) {
  for (const node of nodes) {
    const path = pathPrefix ? `${pathPrefix} ${node.name}` : node.name
    out[path] = [node.lat, node.lng]
    if (node.children.length > 0) {
      buildCoordsMap(node.children, path, out)
    }
  }
}

const _map: Record<string, [number, number]> = {}
buildCoordsMap((data as RegionData).sido, '', _map)

export const REGION_COORDS: Record<string, [number, number]> = _map
