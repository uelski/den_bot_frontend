import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FEEDBACK_CATEGORIES } from "@/lib/constants"

export interface DataSourceFields {
  category: string
  source: string
  usefulness: string
}

interface Props {
  value: DataSourceFields
  onChange: (next: DataSourceFields) => void
  disabled?: boolean
}

export function DataSourceForm({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-category">Category</Label>
        <Select
          value={value.category}
          onValueChange={(category) => onChange({ ...value, category })}
          disabled={disabled}
        >
          <SelectTrigger id="ds-category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-source">Suggested source name or URL</Label>
        <Input
          id="ds-source"
          value={value.source}
          onChange={(e) => onChange({ ...value, source: e.target.value })}
          disabled={disabled}
          required
          placeholder="e.g. https://data.denvergov.org/..."
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ds-usefulness">Why would this be useful?</Label>
        <Textarea
          id="ds-usefulness"
          value={value.usefulness}
          onChange={(e) => onChange({ ...value, usefulness: e.target.value })}
          disabled={disabled}
          required
          rows={2}
          className="min-h-16"
        />
      </div>
    </div>
  )
}
