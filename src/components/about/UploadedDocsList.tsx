import { useEffect, useState } from "react"
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { knowledgeBaseApi } from "@/api/knowledge-base-api"
import type { KnowledgeBaseDocument } from "@/api/knowledge-base-types"
import { openDocumentDownload } from "@/lib/download-document"

type Status = "loading" | "loaded" | "error"

// Formats an ISO-8601 timestamp as "Added Jun 8, 2026" — keeps the date scan-
// able but localized. Returns "" for missing/invalid input.
function formatUploadedAt(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `Added ${new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)}`
}

export function UploadedDocsList() {
  const [status, setStatus] = useState<Status>("loading")
  const [docs, setDocs] = useState<KnowledgeBaseDocument[]>([])

  // The initial fetch lives directly inside useEffect so the effect body has
  // no setState-bearing closure call (react-hooks/set-state-in-effect). The
  // `cancelled` flag guards against the component unmounting mid-flight.
  useEffect(() => {
    let cancelled = false
    knowledgeBaseApi
      .listDocuments()
      .then((result) => {
        if (cancelled) return
        setDocs(result)
        setStatus("loaded")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Retry is an event handler (not effect-scheduled) so it's free to setState
  // synchronously. Same fetch shape, different lifecycle.
  const retry = async () => {
    setStatus("loading")
    try {
      const result = await knowledgeBaseApi.listDocuments()
      setDocs(result)
      setStatus("loaded")
    } catch {
      setStatus("error")
    }
  }

  if (status === "loading") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading documents…
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Couldn't load documents right now.
        </span>
        <Button variant="outline" size="sm" onClick={retry}>
          Retry
        </Button>
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div className="mt-3 rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        No documents in the knowledge base yet.
      </div>
    )
  }

  return (
    <ul className="mt-3 flex flex-col gap-3">
      {docs.map((doc) => (
        <li key={doc.document_id}>
          <DocCard doc={doc} />
        </li>
      ))}
    </ul>
  )
}

interface DocCardProps {
  doc: KnowledgeBaseDocument
}

function DocCard({ doc }: DocCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const added = formatUploadedAt(doc.uploaded_at)
  const pages = `${doc.page_count} page${doc.page_count === 1 ? "" : "s"}`

  const handleDownload = async () => {
    if (downloading) return
    setError(null)
    setDownloading(true)
    try {
      await openDocumentDownload(doc.document_id)
    } catch {
      setError("Download link couldn't be generated — try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <FileText className="h-8 w-8 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <span className="break-words">{doc.document_title}</span>
            {doc.category && (
              <span className="rounded-sm bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
                {doc.category}
              </span>
            )}
          </CardTitle>
          <CardDescription className="mt-1.5 text-xs">
            {[added, pages].filter(Boolean).join(" · ")}
          </CardDescription>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {doc.source_url && (
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View on denvergov.org
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              aria-label={`Download ${doc.document_title}`}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading ? "Preparing…" : "Download"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
