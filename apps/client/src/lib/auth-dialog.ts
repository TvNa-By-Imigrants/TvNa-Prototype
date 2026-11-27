export type AuthMode = "login" | "register"

const AUTH_DIALOG_EVENT = "auth:open-dialog"

// A route guard can ask for the dialog before the shell that renders it has
// mounted, so the request is parked until AppShell drains it.
let pendingMode: AuthMode | null = null

/** Open the auth dialog from anywhere. The dialog is the only auth surface. */
export function openAuthDialog(mode: AuthMode = "login") {
  pendingMode = mode
  window.dispatchEvent(new Event(AUTH_DIALOG_EVENT))
}

export function takeAuthDialogRequest(): AuthMode | null {
  const mode = pendingMode
  pendingMode = null
  return mode
}

export function onAuthDialogRequest(handler: () => void) {
  window.addEventListener(AUTH_DIALOG_EVENT, handler)
  return () => window.removeEventListener(AUTH_DIALOG_EVENT, handler)
}
