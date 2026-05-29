import { describe, it, expect, vi, afterEach } from "vitest"
import { fireEvent, render, screen, cleanup } from "@testing-library/react"
import { MetadataFields } from "./MetadataFields"
import type { UploadMetadata } from "@/api/admin-types"
import { PDF_CATEGORIES } from "@/lib/constants"

const base: UploadMetadata = {
  category: PDF_CATEGORIES[0],
  document_title: "",
  original_filename: "",
  source_url: "",
}

afterEach(() => {
  cleanup()
})

describe("MetadataFields", () => {
  it("renders the current values", () => {
    render(
      <MetadataFields
        value={{
          ...base,
          document_title: "My Doc",
          original_filename: "doc.pdf",
          source_url: "https://example.com",
        }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/document title/i)).toHaveValue("My Doc")
    expect(screen.getByLabelText(/original filename/i)).toHaveValue("doc.pdf")
    expect(screen.getByLabelText(/source url/i)).toHaveValue(
      "https://example.com"
    )
  })

  it("emits changes for text fields", () => {
    const onChange = vi.fn()
    render(<MetadataFields value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText(/document title/i), {
      target: { value: "Title" },
    })
    expect(onChange).toHaveBeenCalledWith({ ...base, document_title: "Title" })
  })

  it("shows the selected category on the trigger", () => {
    render(
      <MetadataFields value={{ ...base, category: "budget" }} onChange={vi.fn()} />
    )
    expect(screen.getByLabelText(/category/i)).toHaveTextContent("budget")
  })
})
