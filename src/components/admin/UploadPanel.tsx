import { useRef, useState, type ChangeEvent } from "react"
import { CheckCircle2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { adminApi } from "@/api/admin-api"
import { AdminApiError, type UploadMetadata } from "@/api/admin-types"
import {
  uploadPdfToSignedUrl,
  UploadAbortedError,
  UploadError,
} from "@/lib/upload"
import { PDF_CATEGORIES } from "@/lib/constants"
import { MetadataFields } from "./MetadataFields"

type Status = "idle" | "requesting" | "uploading" | "success" | "error"

interface Props {
  password: string
  // Called when the backend reports the session is no longer valid (401),
  // so the page can clear sessionStorage and drop back to the gate.
  onSessionExpired: () => void
}

const emptyMetadata: UploadMetadata = {
  category: PDF_CATEGORIES[0],
  document_title: "",
  original_filename: "",
  source_url: "",
}

export function UploadPanel({ password, onSessionExpired }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<UploadMetadata>(emptyMetadata)
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBusy = status === "requesting" || status === "uploading"

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    if (picked) {
      // Prefill the (editable) filename from the picker.
      setMetadata((m) => ({ ...m, original_filename: picked.name }))
    }
  }

  const isValid =
    file !== null &&
    metadata.document_title.trim().length > 0 &&
    metadata.original_filename.trim().length > 0 &&
    metadata.source_url.trim().length > 0

  const handleUpload = async () => {
    if (!file || !isValid || isBusy) return
    setErrorMessage(null)
    setProgress(0)
    setStatus("requesting")

    let upload
    try {
      upload = await adminApi.createUploadUrl(metadata, password)
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        onSessionExpired()
        return
      }
      setStatus("error")
      setErrorMessage(
        err instanceof AdminApiError
          ? err.message
          : "Could not get an upload URL. Try again."
      )
      return
    }

    setStatus("uploading")
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await uploadPdfToSignedUrl(
        file,
        upload.signed_url,
        upload.required_headers,
        {
          signal: controller.signal,
          onProgress: (fraction) => setProgress(Math.round(fraction * 100)),
        }
      )
      setStatus("success")
    } catch (err) {
      if (err instanceof UploadAbortedError) {
        setStatus("idle")
        setProgress(0)
        return
      }
      setStatus("error")
      if (err instanceof UploadError && err.status === 403) {
        setErrorMessage(
          "Upload was rejected (link expired or tampered). Start over."
        )
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Upload failed. Try again."
        )
      }
    } finally {
      abortRef.current = null
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
  }

  const handleReset = () => {
    setFile(null)
    setMetadata(emptyMetadata)
    setStatus("idle")
    setProgress(0)
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (status === "success") {
    return (
      <Card className="w-[min(28rem,calc(100vw-2rem))]">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-sm font-medium">Uploaded.</p>
          <p className="text-xs text-muted-foreground">
            Ingestion is running in the background.
          </p>
          <Button variant="outline" onClick={handleReset}>
            Upload another
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[min(28rem,calc(100vw-2rem))]">
      <CardHeader>
        <CardTitle>Upload PDF</CardTitle>
        <CardDescription>
          Add a PDF to the knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-file">PDF file</Label>
          <input
            ref={fileInputRef}
            id="admin-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isBusy}
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80"
          />
        </div>

        <MetadataFields
          value={metadata}
          onChange={setMetadata}
          disabled={isBusy}
        />

        {status === "uploading" && (
          <div className="flex flex-col gap-1.5">
            <Progress value={progress} aria-label="Upload progress" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        {errorMessage && (
          <p className="text-xs text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!isValid || isBusy}
            className="flex-1"
          >
            <Upload className="h-4 w-4" />
            {status === "requesting"
              ? "Preparing…"
              : status === "uploading"
                ? "Uploading…"
                : "Upload"}
          </Button>
          {status === "uploading" && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
