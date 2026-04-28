import { Search } from "lucide-react"

interface ToolCallIndicatorProps {
  label: string
}

export function ToolCallIndicator({ label }: ToolCallIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80">
      <Search className="h-3 w-3 animate-pulse" />
      <span>{label}</span>
    </span>
  )
}
