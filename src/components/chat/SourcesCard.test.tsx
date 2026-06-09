import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  fireEvent,
  render,
  screen,
  cleanup,
  within,
  waitFor,
} from "@testing-library/react"
import { SourcesCard } from "./SourcesCard"
import { makeSource, makeKbSource } from "@/test/helpers"
import { KnowledgeBaseApiError } from "@/api/knowledge-base-types"

const openDocumentDownload = vi.fn()

vi.mock("@/lib/download-document", () => ({
  openDocumentDownload: (...args: unknown[]) => openDocumentDownload(...args),
}))

beforeEach(() => {
  openDocumentDownload.mockReset()
})

afterEach(() => {
  cleanup()
})

describe("SourcesCard — knowledge base rendering", () => {
  it("renders no Knowledge base section when no KB sources are present", () => {
    render(<SourcesCard sources={[makeSource({ service_name: "Parks" })]} />)
    expect(screen.queryByText(/Knowledge base/i)).not.toBeInTheDocument()
  })

  it("renders title as a link to source_url when present", () => {
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "Denver Code of Ordinances",
            source_url: "https://municode.test/denver",
            page_start: 11,
            page_end: 14,
          }),
        ]}
      />
    )
    expect(screen.getByText(/Knowledge base/i)).toBeInTheDocument()
    const link = screen.getByRole("link", {
      name: /Denver Code of Ordinances/,
    })
    expect(link).toHaveAttribute("href", "https://municode.test/denver")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    // Page-range suffix is part of the link text.
    expect(link).toHaveTextContent("pp. 11–14")
  })

  it("renders title as plain text when source_url is absent", () => {
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "Untitled Internal Memo",
            page_start: 3,
            page_end: 3,
          }),
        ]}
      />
    )
    expect(
      screen.queryByRole("link", { name: /Untitled Internal Memo/ })
    ).not.toBeInTheDocument()
    // Collapses to "p. 3" for a single-page citation.
    expect(screen.getByText(/Untitled Internal Memo, p\. 3/)).toBeInTheDocument()
  })

  it("omits the page suffix when page_start is undefined", () => {
    render(
      <SourcesCard
        sources={[
          makeKbSource({ document_title: "Whole-doc Reference" }),
        ]}
      />
    )
    const text = screen.getByText(/Whole-doc Reference/)
    expect(text.textContent).toBe("Whole-doc Reference")
  })

  it("renders the category as a small badge when present", () => {
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "Budget 2026",
            category: "budget",
            page_start: 42,
            page_end: 42,
          }),
        ]}
      />
    )
    expect(screen.getByText("budget")).toBeInTheDocument()
  })

  it("does not render a Download button when document_id is absent", () => {
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "Untitled Memo",
            page_start: 1,
          }),
        ]}
      />
    )
    expect(
      screen.queryByRole("button", { name: /Download PDF/i })
    ).not.toBeInTheDocument()
  })

  it("renders a Download button when document_id is present and triggers the helper on click", async () => {
    openDocumentDownload.mockResolvedValue(undefined)
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "2026 Budget",
            document_id: "pdfs/budget/x.pdf",
          }),
        ]}
      />
    )
    const button = screen.getByRole("button", { name: /Download PDF/i })
    fireEvent.click(button)
    await waitFor(() => {
      expect(openDocumentDownload).toHaveBeenCalledWith("pdfs/budget/x.pdf")
    })
  })

  it("surfaces an inline error when the download helper rejects", async () => {
    openDocumentDownload.mockRejectedValue(new KnowledgeBaseApiError(404))
    render(
      <SourcesCard
        sources={[
          makeKbSource({
            document_title: "Missing Doc",
            document_id: "pdfs/missing/x.pdf",
          }),
        ]}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: /Download PDF/i }))
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Download link/i)
    })
  })

  it("renders both legacy and KB sources together with their own headers", () => {
    render(
      <SourcesCard
        sources={[
          makeSource({ service_name: "Parks", hub_url: "https://hub.test" }),
          makeKbSource({
            document_title: "Denver Code of Ordinances",
            page_start: 11,
            page_end: 14,
          }),
        ]}
      />
    )
    expect(screen.getByText("Sources")).toBeInTheDocument()
    expect(screen.getByText("Knowledge base")).toBeInTheDocument()
    // The KB section contains the doc title with its page range.
    const kbHeading = screen.getByText("Knowledge base")
    const kbList = kbHeading.nextElementSibling as HTMLElement
    expect(within(kbList).getByText(/Denver Code of Ordinances/)).toBeInTheDocument()
  })
})
