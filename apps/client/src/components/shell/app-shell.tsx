import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate, useRouterState } from "@tanstack/react-router"

import {
  AuthDialog,
  LogoutDialog,
  type AuthMode,
} from "@/components/organisms/auth/auth-dialog"
import { EditProfileDialog } from "@/components/page/profile"
import { signOut } from "@/lib/auth"
import { onAuthDialogRequest, takeAuthDialogRequest } from "@/lib/auth-dialog"
import { usePermissions } from "@/lib/permissions"
import { useProfileContext } from "@/lib/profile-context"

import { Header } from "./header"
import { BottomNav } from "./nav"

export type AppShellProps = {
  children: ReactNode
}

/**
 * App shell: sticky header, centered 1280px content column, and fixed
 * bottom navigation on mobile. Owns the auth dialogs so Login / Register
 * open as pop-ups without leaving the current page.
 */
export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate()
  const { refresh, user } = usePermissions()
  const { getOwnerProfile } = useProfileContext()
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const ownerProfile = getOwnerProfile()

  // The mobile header is content-height and changes with Khmer wrapping, font
  // loading and zoom. Publish its measured height for the sticky tabs to use.
  useEffect(() => {
    const header = headerRef.current
    const shell = shellRef.current
    if (!header || !shell || typeof ResizeObserver === "undefined") return

    const publish = () =>
      shell.style.setProperty("--header-h", `${header.getBoundingClientRect().height}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // Route guards and inline links ask for the dialog through this event, so
  // they never need to know the shell exists.
  useEffect(() => {
    const open = () => setAuthMode(takeAuthDialogRequest() ?? "login")
    const unsubscribe = onAuthDialogRequest(open)
    // Drain anything a route guard requested before this shell mounted.
    const pending = takeAuthDialogRequest()
    if (pending) setAuthMode(pending)
    return unsubscribe
  }, [])

  const isAuthOnlyRoute = useRouterState({
    select: (state) =>
      state.matches.some(
        (match) =>
          match.routeId === "/_authenticated" ||
          match.routeId.startsWith("/_authenticated/"),
      ),
  })

  const handleSignedIn = async () => {
    await refresh()
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
      setLogoutOpen(false)
      await refresh()
      // Signed-in-only pages cannot render without a session and their guard
      // only runs on navigation, so send them home. Everything else stays put.
      if (isAuthOnlyRoute) await navigate({ to: "/" })
    }
  }

  return (
    <div ref={shellRef} className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        onAuthAction={setAuthMode}
        onSignOut={() => setLogoutOpen(true)}
        onEditProfile={() => setEditProfileOpen(true)}
        headerRef={headerRef}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 pt-6 pb-24 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] lg:pt-8 lg:pb-10 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        {children}
      </main>
      <BottomNav />

      <AuthDialog
        open={authMode !== null}
        mode={authMode ?? "login"}
        onOpenChange={(open) => setAuthMode(open ? (authMode ?? "login") : null)}
        onSignedIn={handleSignedIn}
      />

      <LogoutDialog
        open={logoutOpen}
        pending={signingOut}
        onOpenChange={setLogoutOpen}
        onConfirm={handleSignOut}
      />

      {user && ownerProfile ? (
        <EditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          profile={ownerProfile}
        />
      ) : null}
    </div>
  )
}
