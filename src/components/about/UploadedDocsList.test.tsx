import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react"
import { UploadedDocsList } from "./UploadedDocsList"
import type { KnowledgeBaseDocument } from "@/api/knowledge-base-types"
import { KnowledgeBaseApiError } from "@/api/knowledge-base-types"

const listDocuments = vi.fn()
const openDocumentDownload = vi.fn()

vi.mock("@/api/knowledge-base-api", () => ({
  knowledgeBaseApi: {
    listDocuments: (...args: unknown[]) => listDocuments(...args),
    getDownloadUrl: vi.fn(),
  },
}))

vi.mock("@/lib/download-document", () => ({
  openDocumentDownload: (...args: unknown[]) => openDocumentDownload(...args),
}))

beforeEach(() => {
  listDocuments.mockReset()
  openDocumentDownload.mockReset()
})

afterEach(() => {
  cleanup()
})

const fullDoc: KnowledgeBaseDocument = {
  document_id: "pdfs/budget/2026-x.pdf",
  document_title: "2026 Budget Highlights",
  category: "budget",
  source_url: "https://denvergov.org/budget.pdf",
  original_filename: "budget.pdf",
  uploaded_at: "2026-06-08T14:30:22+00:00",
  num_chunks: 42,
  page_count: 18,
}

const noSourceUrl: KnowledgeBaseDocument = {
  document_id: "pdfs/internal/x.pdf",
  document_title: "Internal Memo",
  category: null,
  source_url: null,
  original_filename: null,
  uploaded_at: null,
  num_chunks: 1,
  page_count: 1,
}

describe("UploadedDocsList", () => {
  it("renders an empty-state message when the API returns no docs", async () => {
    listDocuments.mockResolvedValue([])
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText(/No documents in the knowledge base/i)).toBeInTheDocument()
    })
  })

  it("renders loaded docs with metadata and actions", async () => {
    listDocuments.mockResolvedValue([fullDoc])
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText("2026 Budget Highlights")).toBeInTheDocument()
    })
    // Category badge.
    expect(screen.getByText("budget")).toBeInTheDocument()
    // Metadata line: "Added <date> · 18 pages".
    expect(screen.getByText(/18 pages/)).toBeInTheDocument()
    expect(screen.getByText(/Added /)).toBeInTheDocument()
    // View link present.
    const viewLink = screen.getByRole("link", { name: /View on denvergov\.org/i })
    expect(viewLink).toHaveAttribute("href", "https://denvergov.org/budget.pdf")
    expect(viewLink).toHaveAttribute("target", "_blank")
    // Download button present.
    expect(
      screen.getByRole("button", { name: /Download 2026 Budget Highlights/i })
    ).toBeInTheDocument()
  })

  it("omits the View link when source_url is null", async () => {
    listDocuments.mockResolvedValue([noSourceUrl])
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText("Internal Memo")).toBeInTheDocument()
    })
    expect(
      screen.queryByRole("link", { name: /View on denvergov\.org/i })
    ).not.toBeInTheDocument()
    // Single page → "1 page" not "1 pages".
    expect(screen.getByText(/1 page$/)).toBeInTheDocument()
  })

  it("calls the download helper with the doc's id on click", async () => {
    listDocuments.mockResolvedValue([fullDoc])
    openDocumentDownload.mockResolvedValue(undefined)
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText("2026 Budget Highlights")).toBeInTheDocument()
    })
    fireEvent.click(
      screen.getByRole("button", { name: /Download 2026 Budget Highlights/i })
    )
    await waitFor(() => {
      expect(openDocumentDownload).toHaveBeenCalledWith("pdfs/budget/2026-x.pdf")
    })
  })

  it("shows an error state with a Retry button on load failure, then recovers", async () => {
    listDocuments.mockRejectedValueOnce(new KnowledgeBaseApiError(503))
    listDocuments.mockResolvedValueOnce([fullDoc])
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText(/Couldn't load documents/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole("button", { name: /Retry/i }))
    await waitFor(() => {
      expect(screen.getByText("2026 Budget Highlights")).toBeInTheDocument()
    })
  })

  it("surfaces an inline error when a per-doc download fails", async () => {
    listDocuments.mockResolvedValue([fullDoc])
    openDocumentDownload.mockRejectedValue(new KnowledgeBaseApiError(404))
    render(<UploadedDocsList />)
    await waitFor(() => {
      expect(screen.getByText("2026 Budget Highlights")).toBeInTheDocument()
    })
    fireEvent.click(
      screen.getByRole("button", { name: /Download 2026 Budget Highlights/i })
    )
    await waitFor(() => {
      const alert = screen.getByRole("alert")
      expect(within(alert).getByText(/Download link/i)).toBeInTheDocument()
    })
  })
})
