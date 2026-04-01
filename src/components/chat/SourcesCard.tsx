import { ExternalLink } from "lucide-react"

interface Source {
  service_name: string
  base_url: string
  hub_url?: string
}

interface SourcesCardProps {
  sources: Source[]
}

export function SourcesCard({ sources }: SourcesCardProps) {
  const sorted = [...sources].sort((a, b) => {
    if (a.hub_url && !b.hub_url) return -1
    if (!a.hub_url && b.hub_url) return 1
    return 0
  })

  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      <p className="mb-1.5 font-medium text-muted-foreground">Sources</p>
      <ul className="flex flex-col gap-1">
        {sorted.map((source) => (
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
      </ul>
    </div>
  )
}
