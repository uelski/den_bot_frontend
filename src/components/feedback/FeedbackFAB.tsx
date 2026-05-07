import { useEffect, useRef, useState } from "react"
import { MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { FeedbackPanel } from "./FeedbackPanel"

const PULSE_DURATION_MS = 30_000

export function FeedbackFAB() {
  const [open, setOpen] = useState(false)
  const [openSeq, setOpenSeq] = useState(0)
  const [pulsing, setPulsing] = useState(true)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPulsing(false), PULSE_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  const handleToggle = () => {
    setPulsing(false)
    setOpen((wasOpen) => {
      if (!wasOpen) setOpenSeq((s) => s + 1)
      return !wasOpen
    })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Send feedback"
        aria-expanded={open}
        aria-controls="feedback-panel"
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          pulsing && !open && "animate-pulse ring-4 ring-primary/30"
        )}
      >
        <MessageSquarePlus className="h-5 w-5" />
      </button>
      <FeedbackPanel
        open={open}
        openSeq={openSeq}
        onClose={() => setOpen(false)}
        triggerRef={buttonRef}
      />
    </>
  )
}
