import { ExternalLink } from "lucide-react"
import type { Source } from "@/types/chat"
import { groupSources } from "@/lib/group-sources"

interface SourcesCardProps {
  sources: Source[]
}

export function SourcesCard({ sources }: SourcesCardProps) {
  const { catalog, neighborhoodGroups } = groupSources(sources)

  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      <p className="mb-1.5 font-medium text-muted-foreground">Sources</p>
      <ul className="flex flex-col gap-2">
        {catalog.map((source) => {
          const isDenverGovSearch = source.doc_type === "denvergov_search_result"
          const colorClass = isDenverGovSearch
            ? "text-[#bf311a]"
            : source.hub_url
              ? "text-[#477648]"
              : "text-primary"
          return (
            <li key={source.base_url} className="flex items-baseline gap-1.5 min-w-0">
              <ExternalLink className={`h-3 w-3 shrink-0 relative top-[1px] ${colorClass}`} />
              <a
                href={source.hub_url ?? source.base_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`min-w-0 break-words hover:underline ${colorClass}`}
              >
                {source.service_name}
              </a>
              {isDenverGovSearch ? (
                <>
                  <span className="shrink-0 text-muted-foreground">·</span>
                  <span className="shrink-0 rounded-sm bg-[#FFB81C]/20 px-1.5 text-[11px] font-medium text-[#bf311a]">
                    denvergov.org
                  </span>
                </>
              ) : (
                <>
                  <span className="shrink-0 text-muted-foreground">·</span>
                  {source.hub_url ? (
                    <span className="shrink-0 text-[#477648]">Hub</span>
                  ) : (
                    <span className="shrink-0 text-muted-foreground">Basic</span>
                  )}
                </>
              )}
            </li>
          )
        })}
        {neighborhoodGroups.map((group) => (
          <li key={group.service_name}>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <ExternalLink className="h-3 w-3 shrink-0 relative top-[1px] text-[#477648]" />
              <a
                href={group.hub_url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 break-words text-[#477648] hover:underline"
              >
                {group.service_name}
              </a>
              <span className="shrink-0 text-muted-foreground">·</span>
              <span className="shrink-0 text-[#477648]">Hub</span>
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
