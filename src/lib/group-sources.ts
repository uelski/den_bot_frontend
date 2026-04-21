import type { Source } from "@/types/chat"

export interface NeighborhoodGroup {
  service_name: string
  hub_url: string
  neighborhoods: string[]
}

export function groupSources(sources: Source[]) {
  const catalog: Source[] = []
  const neighborhoodMap = new Map<string, NeighborhoodGroup>()

  for (const source of sources) {
    if (source.doc_type === "neighborhood_demographics" && source.neighborhood_name) {
      const key = `${source.service_name}||${source.hub_url ?? source.base_url}`
      const existing = neighborhoodMap.get(key)
      if (existing) {
        if (!existing.neighborhoods.includes(source.neighborhood_name)) {
          existing.neighborhoods.push(source.neighborhood_name)
        }
      } else {
        neighborhoodMap.set(key, {
          service_name: source.service_name,
          hub_url: source.hub_url ?? source.base_url,
          neighborhoods: [source.neighborhood_name],
        })
      }
    } else {
      catalog.push(source)
    }
  }

  const catalogSorted = [...catalog].sort((a, b) => {
    if (a.hub_url && !b.hub_url) return -1
    if (!a.hub_url && b.hub_url) return 1
    return 0
  })

  return { catalog: catalogSorted, neighborhoodGroups: [...neighborhoodMap.values()] }
}
