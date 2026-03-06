import type { ReactNode } from "react"
import { Navbar } from "./Navbar"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
