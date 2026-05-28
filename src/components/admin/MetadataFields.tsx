import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PDF_CATEGORIES } from "@/lib/constants"
import type { UploadMetadata } from "@/api/admin-types"

interface Props {
  value: UploadMetadata
  onChange: (next: UploadMetadata) => void
  disabled?: boolean
}

export function MetadataFields({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-category">Category</Label>
        <Select
          value={value.category}
          onValueChange={(category) =>
            onChange({ ...value, category: category as UploadMetadata["category"] })
          }
          disabled={disabled}
        >
          <SelectTrigger id="admin-category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {PDF_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-title">Document title</Label>
        <Input
          id="admin-title"
          value={value.document_title}
          onChange={(e) =>
            onChange({ ...value, document_title: e.target.value })
          }
          disabled={disabled}
          required
          maxLength={300}
          placeholder="e.g. Denver Code of Ordinances"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-filename">Original filename</Label>
        <Input
          id="admin-filename"
          value={value.original_filename}
          onChange={(e) =>
            onChange({ ...value, original_filename: e.target.value })
          }
          disabled={disabled}
          required
          maxLength={300}
          placeholder="Municode Denver CO.pdf"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-source-url">Source URL</Label>
        <Input
          id="admin-source-url"
          type="url"
          value={value.source_url}
          onChange={(e) => onChange({ ...value, source_url: e.target.value })}
          disabled={disabled}
          required
          placeholder="https://library.municode.com/co/denver/..."
        />
      </div>
    </div>
  )
}
