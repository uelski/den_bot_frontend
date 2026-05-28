import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminGate } from "@/components/admin/AdminGate"
import { UploadPanel } from "@/components/admin/UploadPanel"
import { ADMIN_PASSWORD_STORAGE_KEY } from "@/lib/constants"

export default function AdminPage() {
  // Seed from sessionStorage so a refresh doesn't re-prompt. The value only
  // lives for the tab's lifetime.
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)
  )

  const handleUnlock = (pw: string) => {
    sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, pw)
    setPassword(pw)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY)
    setPassword(null)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      {password === null ? (
        <AdminGate onUnlock={handleUnlock} />
      ) : (
        <>
          <UploadPanel password={password} onSessionExpired={handleLogout} />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            Log out
          </Button>
        </>
      )}
    </main>
  )
}
