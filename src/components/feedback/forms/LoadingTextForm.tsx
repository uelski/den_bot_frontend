import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export interface LoadingTextFields {
  phrase: string
}

interface Props {
  value: LoadingTextFields
  onChange: (next: LoadingTextFields) => void
  disabled?: boolean
}

const EXAMPLES = [
  "bluecifering",
  "14ering",
  "stuck-on-i70ing",
  "green-chile-smothering",
]

export function LoadingTextForm({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lt-phrase">Your suggested loading message</Label>
        <Input
          id="lt-phrase"
          value={value.phrase}
          onChange={(e) => onChange({ phrase: e.target.value })}
          disabled={disabled}
          required
          placeholder="e.g. red-rocks-amphitheater-ing"
        />
      </div>
      <div className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="mb-1 font-medium text-foreground">For inspiration:</div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {EXAMPLES.map((ex) => (
            <li key={ex} className="font-mono">
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
