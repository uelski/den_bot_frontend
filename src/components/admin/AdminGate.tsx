import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { adminApi } from "@/api/admin-api"
import { AdminApiError } from "@/api/admin-types"

type Status = "idle" | "checking" | "error"

interface Props {
  onUnlock: (password: string) => void
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return "Incorrect password."
    case 429:
      return "Too many attempts — try again in a minute."
    case 503:
      return "Admin is unavailable right now."
    default:
      return "Something went wrong. Try again."
  }
}

export function AdminGate({ onUnlock }: Props) {
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isChecking = status === "checking"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isChecking) return
    setStatus("checking")
    setErrorMessage(null)
    try {
      await adminApi.validatePassword(password)
      onUnlock(password)
    } catch (err) {
      const httpStatus = err instanceof AdminApiError ? err.status : 0
      setStatus("error")
      setErrorMessage(messageForStatus(httpStatus))
    }
  }

  return (
    <Card className="w-[min(24rem,calc(100vw-2rem))]">
      <CardHeader>
        <CardTitle>Admin</CardTitle>
        <CardDescription>Enter the admin password to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isChecking}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          <Button type="submit" disabled={!password.trim() || isChecking}>
            {isChecking ? "Checking…" : "Unlock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
