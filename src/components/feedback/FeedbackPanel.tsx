import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react"
import { X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { chatApi } from "@/api/chat-api"
import type { FeedbackPayload, FeedbackType } from "@/api/types"
import { useChat } from "@/hooks/useChat"
import { FeedbackTypePills } from "./FeedbackTypePills"
import { BugReportForm, type BugFields } from "./forms/BugReportForm"
import {
  DataSourceForm,
  type DataSourceFields,
} from "./forms/DataSourceForm"
import {
  LoadingTextForm,
  type LoadingTextFields,
} from "./forms/LoadingTextForm"
import { GeneralForm, type GeneralFields } from "./forms/GeneralForm"
import { FEEDBACK_CATEGORIES } from "@/lib/constants"

type Status = "idle" | "submitting" | "success" | "error"

interface PanelProps {
  open: boolean
  openSeq: number
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function FeedbackPanel({
  open,
  openSeq,
  onClose,
  triggerRef,
}: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        triggerRef.current?.focus()
      }
    }
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return
      // Radix Select/Popover render content in a portal outside the panel.
      // Clicks inside those should not be treated as outside-the-panel.
      if (
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[data-slot="select-content"]') ||
        target.closest('[role="listbox"]')
      ) {
        return
      }
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onMouseDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onMouseDown)
    }
  }, [open, onClose, triggerRef])

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby="feedback-heading"
      aria-hidden={!open}
      className={cn(
        "fixed bottom-20 right-6 z-50 w-[min(22rem,calc(100vw-3rem))] origin-bottom-right rounded-lg border bg-background shadow-xl transition-all",
        open
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-95 opacity-0"
      )}
    >
      <div className="flex items-start justify-between border-b px-4 py-3">
        <div>
          <h2 id="feedback-heading" className="text-sm font-semibold">
            Send feedback
          </h2>
          <p className="text-xs text-muted-foreground">
            Help shape Blue Cypher.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback panel"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <FeedbackPanelForm key={openSeq} onClose={onClose} />
    </div>
  )
}

interface FormProps {
  onClose: () => void
}

function FeedbackPanelForm({ onClose }: FormProps) {
  const { messages } = useChat()

  const lastUserQuery = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content
    }
    return ""
  }, [messages])

  const [type, setType] = useState<FeedbackType>("bug")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  const [bug, setBug] = useState<BugFields>(() => ({
    intent: "",
    problem: "",
    query: lastUserQuery,
  }))
  const [dataSource, setDataSource] = useState<DataSourceFields>({
    category: FEEDBACK_CATEGORIES[0],
    source: "",
    usefulness: "",
  })
  const [loadingText, setLoadingText] = useState<LoadingTextFields>({
    phrase: "",
  })
  const [general, setGeneral] = useState<GeneralFields>({ message: "" })

  const firstFieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const el = firstFieldRef.current?.querySelector<HTMLElement>(
        "input:not([type='hidden']), textarea, [role='combobox']"
      )
      el?.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [type])

  const isValid = (() => {
    switch (type) {
      case "bug":
        return bug.intent.trim().length > 0 && bug.problem.trim().length > 0
      case "data_source":
        return (
          dataSource.category.trim().length > 0 &&
          dataSource.source.trim().length > 0 &&
          dataSource.usefulness.trim().length > 0
        )
      case "loading_text":
        return loadingText.phrase.trim().length > 0
      case "general":
        return general.message.trim().length > 0
    }
  })()

  const buildPayload = (): FeedbackPayload => {
    const trimmedEmail = email.trim() || undefined
    switch (type) {
      case "bug":
        return {
          type: "bug",
          intent: bug.intent.trim(),
          problem: bug.problem.trim(),
          query: bug.query.trim() || undefined,
          email: trimmedEmail,
        }
      case "data_source":
        return {
          type: "data_source",
          category: dataSource.category,
          source: dataSource.source.trim(),
          usefulness: dataSource.usefulness.trim(),
          email: trimmedEmail,
        }
      case "loading_text":
        return {
          type: "loading_text",
          phrase: loadingText.phrase.trim(),
          email: trimmedEmail,
        }
      case "general":
        return {
          type: "general",
          message: general.message.trim(),
          email: trimmedEmail,
        }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid || status === "submitting") return
    setStatus("submitting")
    setErrorMessage(null)
    try {
      const res = await chatApi.submitFeedback(buildPayload())
      if (!res.success) throw new Error("Submission failed")
      setStatus("success")
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setStatus("error")
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      )
    }
  }

  const isSubmitting = status === "submitting"
  const isSuccess = status === "success"

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        <p className="text-sm font-medium">Thanks for the feedback!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-3">
      <FeedbackTypePills
        value={type}
        onChange={setType}
        disabled={isSubmitting}
      />

      <div ref={firstFieldRef}>
        {type === "bug" && (
          <BugReportForm
            value={bug}
            onChange={setBug}
            disabled={isSubmitting}
          />
        )}
        {type === "data_source" && (
          <DataSourceForm
            value={dataSource}
            onChange={setDataSource}
            disabled={isSubmitting}
          />
        )}
        {type === "loading_text" && (
          <LoadingTextForm
            value={loadingText}
            onChange={setLoadingText}
            disabled={isSubmitting}
          />
        )}
        {type === "general" && (
          <GeneralForm
            value={general}
            onChange={setGeneral}
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-email">Email (optional)</Label>
        <Input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          placeholder="you@example.com"
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  )
}
