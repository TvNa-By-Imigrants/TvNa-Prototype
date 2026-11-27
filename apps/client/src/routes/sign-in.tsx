import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { openAuthDialog } from "@/lib/auth-dialog"

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: SignInEntry,
})

/**
 * The dialog is the only sign-in surface, so `/sign-in` has no page of its own.
 * Old links and session-expiry redirects land here, get the dialog, and return
 * to where they were.
 */
function SignInEntry() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    // Let the shell drain the request first so it does not mount mid-navigation.
    openAuthDialog("login")
    void navigate({ to: redirect ?? "/", replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per entry
  }, [])

  return null
}
