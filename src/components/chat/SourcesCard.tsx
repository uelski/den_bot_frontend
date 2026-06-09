import { useState } from "react"
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react"
import type { KnowledgeBaseSource, Source } from "@/types/chat"
import { groupSources } from "@/lib/group-sources"
import { openDocumentDownload } from "@/lib/download-document"

interface SourcesCardProps {
  sources: Source[]
}

// Citation suffix appended to a KB title: " p. 11" / " pp. 11–14" / "".
// Uses an en dash (U+2013) for the range, per the backend's suggested format.
function formatPageRange(start?: number, end?: number): string {
  if (start === undefined) return ""
  if (end === undefined || end === start) return `, p. ${start}`
  return `, pp. ${start}–${end}`
}

export function SourcesCard({ sources }: SourcesCardProps) {
  const { catalog, neighborhoodGroups, knowledgeBase } = groupSources(sources)
  const hasLegacy = catalog.length > 0 || neighborhoodGroups.length > 0
  const hasKb = knowledgeBase.length > 0

  return (
    <div className="mt-3 rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
      {hasLegacy && (
        <>
          <p className="mb-1.5 font-medium text-muted-foreground">Sources</p>
          <ul className="flex flex-col gap-2">
            {catalog.map((source) => {
              const isDenverGovSearch = source.doc_type === "denvergov_search_result"
              const colorClass = isDenverGovSearch
                ? "text-[#bf311a]"
                : source.hub_url
                  ? "text-[#477648]"
                  : "text-primary"
              return (
                <li key={source.base_url} className="flex items-baseline gap-1.5 min-w-0">
                  <ExternalLink className={`h-3 w-3 shrink-0 relative top-[1px] ${colorClass}`} />
                  <a
                    href={source.hub_url ?? source.base_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-w-0 break-words hover:underline ${colorClass}`}
                  >
                    {source.service_name}
                  </a>
                  {isDenverGovSearch ? (
                    <>
                      <span className="shrink-0 text-muted-foreground">·</span>
                      <span className="shrink-0 rounded-sm bg-[#FFB81C]/20 px-1.5 text-[11px] font-medium text-[#bf311a]">
                        denvergov.org
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="shrink-0 text-muted-foreground">·</span>
                      {source.hub_url ? (
                        <span className="shrink-0 text-[#477648]">Hub</span>
                      ) : (
                        <span className="shrink-0 text-muted-foreground">Basic</span>
                      )}
                    </>
                  )}
                </li>
              )
            })}
            {neighborhoodGroups.map((group) => (
              <li key={group.service_name}>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <ExternalLink className="h-3 w-3 shrink-0 relative top-[1px] text-[#477648]" />
                  <a
                    href={group.hub_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 break-words text-[#477648] hover:underline"
                  >
                    {group.service_name}
                  </a>
                  <span className="shrink-0 text-muted-foreground">·</span>
                  <span className="shrink-0 text-[#477648]">Hub</span>
                </div>
                <div className="ml-[18px] mt-1 flex flex-wrap gap-1">
                  {group.neighborhoods.map((name) => (
                    <a
                      key={name}
                      href={group.hub_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-[#477648]/30 bg-[#477648]/10 px-2 py-0.5 text-xs text-[#477648] hover:bg-[#477648]/20 transition-colors"
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasKb && (
        <>
          <p
            className={`mb-1.5 font-medium text-muted-foreground ${hasLegacy ? "mt-3" : ""}`}
          >
            Knowledge base
          </p>
          <ul className="flex flex-col gap-2">
            {knowledgeBase.map((kb, i) => (
              <KbSourceRow
                key={`${kb.document_title}-${kb.page_start ?? "x"}-${kb.page_end ?? "x"}-${i}`}
                source={kb}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

interface KbSourceRowProps {
  source: KnowledgeBaseSource
}

function KbSourceRow({ source: kb }: KbSourceRowProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSuffix = formatPageRange(kb.page_start, kb.page_end)

  const handleDownload = async () => {
    if (!kb.document_id || downloading) return
    setError(null)
    setDownloading(true)
    try {
      await openDocumentDownload(kb.document_id)
    } catch {
      setError("Download link couldn't be generated — try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <li>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <FileText className="h-3 w-3 shrink-0 relative top-[1px] text-primary" />
        {kb.source_url ? (
          <a
            href={kb.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 break-words text-primary hover:underline"
          >
            {kb.document_title}
            {pageSuffix}
          </a>
        ) : (
          <span className="min-w-0 break-words text-foreground">
            {kb.document_title}
            {pageSuffix}
          </span>
        )}
        {kb.category && (
          <>
            <span className="shrink-0 text-muted-foreground">·</span>
            <span className="shrink-0 rounded-sm bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
              {kb.category}
            </span>
          </>
        )}
        {kb.document_id && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download PDF"
            title="Download PDF"
            className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {downloading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="ml-[18px] mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}
