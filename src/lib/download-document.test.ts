import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { openDocumentDownload } from "./download-document"
import { KnowledgeBaseApiError } from "@/api/knowledge-base-types"

const getDownloadUrl = vi.fn()

vi.mock("@/api/knowledge-base-api", () => ({
  knowledgeBaseApi: {
    listDocuments: vi.fn(),
    getDownloadUrl: (...args: unknown[]) => getDownloadUrl(...args),
  },
}))

const openSpy = vi.fn()

beforeEach(() => {
  getDownloadUrl.mockReset()
  openSpy.mockReset()
  vi.stubGlobal("open", openSpy)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("openDocumentDownload", () => {
  it("opens the real download_url in a new tab on success", async () => {
    getDownloadUrl.mockResolvedValue({
      document_id: "pdfs/x.pdf",
      download_url: "https://storage.googleapis.com/signed",
    })
    await openDocumentDownload("pdfs/x.pdf")
    expect(getDownloadUrl).toHaveBeenCalledWith("pdfs/x.pdf")
    expect(openSpy).toHaveBeenCalledWith(
      "https://storage.googleapis.com/signed",
      "_blank",
      "noopener,noreferrer"
    )
  })

  it("does not open a window for mock:// sentinel URLs", async () => {
    getDownloadUrl.mockResolvedValue({
      document_id: "pdfs/x.pdf",
      download_url: "mock://download/pdfs/x.pdf",
    })
    await openDocumentDownload("pdfs/x.pdf")
    expect(openSpy).not.toHaveBeenCalled()
  })

  it("propagates KnowledgeBaseApiError on failure", async () => {
    getDownloadUrl.mockRejectedValue(new KnowledgeBaseApiError(404))
    await expect(openDocumentDownload("pdfs/missing.pdf")).rejects.toBeInstanceOf(
      KnowledgeBaseApiError
    )
    expect(openSpy).not.toHaveBeenCalled()
  })
})
