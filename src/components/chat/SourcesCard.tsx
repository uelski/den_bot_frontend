import { ExternalLink } from "lucide-react"

interface Source {
  service_name: string
  base_url: string
}

interface SourcesCardProps {
  sources: Source[]
}

export function SourcesCard({ sources }: SourcesCardProps) {
  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      <p className="mb-1.5 font-medium text-muted-foreground">Sources</p>
      <ul className="flex flex-col gap-1">
        {sources.map((source) => (
          <li key={source.base_url}>
            <a
              href={source.base_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {source.service_name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
