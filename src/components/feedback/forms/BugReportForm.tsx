import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface BugFields {
  intent: string
  problem: string
  query: string
}

interface Props {
  value: BugFields
  onChange: (next: BugFields) => void
  disabled?: boolean
}

export function BugReportForm({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-intent">What were you trying to do?</Label>
        <Textarea
          id="bug-intent"
          value={value.intent}
          onChange={(e) => onChange({ ...value, intent: e.target.value })}
          disabled={disabled}
          required
          rows={2}
          className="min-h-16"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-problem">What went wrong?</Label>
        <Textarea
          id="bug-problem"
          value={value.problem}
          onChange={(e) => onChange({ ...value, problem: e.target.value })}
          disabled={disabled}
          required
          rows={2}
          className="min-h-16"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-query">Query you submitted (optional)</Label>
        <Input
          id="bug-query"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
