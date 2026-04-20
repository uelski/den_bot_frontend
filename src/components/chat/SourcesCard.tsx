import { ExternalLink } from "lucide-react"
import type { Source } from "@/types/chat"

interface SourcesCardProps {
  sources: Source[]
}

interface NeighborhoodGroup {
  service_name: string
  hub_url: string
  neighborhoods: string[]
}

function groupSources(sources: Source[]) {
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

export function SourcesCard({ sources }: SourcesCardProps) {
  const { catalog, neighborhoodGroups } = groupSources(sources)

  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      <p className="mb-1.5 font-medium text-muted-foreground">Sources</p>
      <ul className="flex flex-col gap-2">
        {catalog.map((source) => (
          <li key={source.base_url} className="inline-flex items-center gap-1.5">
            <ExternalLink className={`h-3 w-3 shrink-0 ${source.hub_url ? "text-[#477648]" : "text-primary"}`} />
            <a
              href={source.hub_url ?? source.base_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline ${source.hub_url ? "text-[#477648]" : "text-primary"}`}
            >
              {source.service_name}
            </a>
            <span className="text-muted-foreground">·</span>
            {source.hub_url ? (
              <span className="text-[#477648]">Hub</span>
            ) : (
              <span className="text-muted-foreground">Basic</span>
            )}
          </li>
        ))}
        {neighborhoodGroups.map((group) => (
          <li key={group.service_name}>
            <div className="inline-flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3 shrink-0 text-[#477648]" />
              <a
                href={group.hub_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#477648] hover:underline"
              >
                {group.service_name}
              </a>
              <span className="text-muted-foreground">·</span>
              <span className="text-[#477648]">Hub</span>
            </div>
            <div className="ml-[18px] mt-1 flex flex-wrap gap-1">
              {group.neighborhoods.map((name) => (
                <a
                  key={name}
                  href={group.hub_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-[#477648]/30 bg-[#477648]/10 px-2 py-0.5 text-xs text-[#477648] hover:bg-[#477648]/20 transition-colors"
                >
                  {name}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
