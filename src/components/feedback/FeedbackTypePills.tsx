import { cn } from "@/lib/utils"
import type { FeedbackType } from "@/api/types"

interface Props {
  value: FeedbackType
  onChange: (next: FeedbackType) => void
  disabled?: boolean
}

const OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "data_source", label: "Data source" },
  { value: "loading_text", label: "Loading text" },
  { value: "general", label: "General" },
]

export function FeedbackTypePills({ value, onChange, disabled }: Props) {
  return (
    <div role="tablist" aria-label="Feedback type" className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
