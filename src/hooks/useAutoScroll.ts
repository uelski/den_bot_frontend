import { useRef, useState, useEffect, useCallback } from "react"

export function useAutoScroll(isStreaming: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const checkIfAtBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 100
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkIfAtBottom)
    return () => el.removeEventListener("scroll", checkIfAtBottom)
  }, [checkIfAtBottom])

  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => {
      if (isAtBottom && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isStreaming, isAtBottom])

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [])

  return { scrollRef, isAtBottom, scrollToBottom }
}
