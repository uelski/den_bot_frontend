import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const LOADING_PHRASES = [
  "bluecifering",
  "schussing",
  "no friends on a pow daying",
  "rocky mountain highing",
  "stuck on i70ing",
  "altitude acclimating",
  "14ering",
  "subie subieing",
  "mary janeing",
  "green chile smothering"
]

const ROTATE_INTERVAL_MS = 6000

export function LoadingIndicator() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_PHRASES.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>{LOADING_PHRASES[index]}...</span>
    </span>
  )
}
