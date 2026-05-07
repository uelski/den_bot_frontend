import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface GeneralFields {
  message: string
}

interface Props {
  value: GeneralFields
  onChange: (next: GeneralFields) => void
  disabled?: boolean
}

export function GeneralForm({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="general-message">Your feedback</Label>
      <Textarea
        id="general-message"
        value={value.message}
        onChange={(e) => onChange({ message: e.target.value })}
        disabled={disabled}
        required
        rows={4}
        className="min-h-24"
      />
    </div>
  )
}
