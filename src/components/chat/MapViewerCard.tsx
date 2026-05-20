import { Map } from "lucide-react"

interface MapViewerCardProps {
  url: string
  label: string
}

export function MapViewerCard({ url, label }: MapViewerCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="mt-2 flex flex-col gap-1 rounded-md bg-blue-50 px-3 py-2.5 text-sm text-blue-800 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900 sm:flex-row sm:items-center sm:gap-2"
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Map className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate font-medium">{label}</span>
      </span>
      <span className="text-xs text-blue-600 underline dark:text-blue-400">
        Open map
      </span>
    </a>
  )
}
