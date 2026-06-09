import type {
  DownloadUrlResponse,
  KnowledgeBaseApiInterface,
  KnowledgeBaseDocument,
} from "../knowledge-base-types"

// Sentinel signed_url the mock returns; src/lib/download-document.ts
// recognizes the mock:// scheme and skips the real window.open.
export const MOCK_DOWNLOAD_URL_PREFIX = "mock://download"

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Three canned docs covering the metadata permutations the UI must handle:
// full metadata, missing source_url, missing category.
const CANNED_DOCS: KnowledgeBaseDocument[] = [
  {
    document_id: "pdfs/budget/2026-06-08T143022-budget-highlights.pdf",
    document_title: "2026 Budget Highlights",
    category: "budget",
    source_url: "https://denvergov.org/files/budget-2026.pdf",
    original_filename: "budget-2026.pdf",
    uploaded_at: "2026-06-08T14:30:22+00:00",
    num_chunks: 42,
    page_count: 18,
  },
  {
    document_id: "pdfs/ordinance/2026-05-15T091200-code-of-ordinances.pdf",
    document_title: "Denver Code of Ordinances",
    category: "ordinance",
    source_url:
      "https://library.municode.com/co/denver/codes/code_of_ordinances",
    original_filename: "Municode Denver CO.pdf",
    uploaded_at: "2026-05-15T09:12:00+00:00",
    num_chunks: 318,
    page_count: 612,
  },
  {
    document_id: "pdfs/general/2026-04-20T101500-internal-memo.pdf",
    document_title: "Internal Planning Memo",
    category: null,
    source_url: null,
    original_filename: "memo.pdf",
    uploaded_at: "2026-04-20T10:15:00+00:00",
    num_chunks: 7,
    page_count: 3,
  },
]

export const mockKnowledgeBaseApi: KnowledgeBaseApiInterface = {
  async listDocuments(): Promise<KnowledgeBaseDocument[]> {
    await delay(400)
    return CANNED_DOCS
  },

  async getDownloadUrl(documentId: string): Promise<DownloadUrlResponse> {
    await delay(250)
    return {
      document_id: documentId,
      download_url: `${MOCK_DOWNLOAD_URL_PREFIX}/${documentId}`,
    }
  },
}
