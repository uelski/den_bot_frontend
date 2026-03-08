import { Map } from "lucide-react"

interface MapViewerCardProps {
  url: string
}

export function MapViewerCard({ url }: MapViewerCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2.5 text-sm text-blue-800 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900"
    >
      <Map className="h-4 w-4 shrink-0" />
      <span className="font-medium">Here is a relevant map</span>
      <span className="ml-auto text-xs text-blue-600 underline dark:text-blue-400">
        Open map
      </span>
    </a>
  )
}
