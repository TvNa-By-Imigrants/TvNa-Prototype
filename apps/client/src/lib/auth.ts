import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export type AuthOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly status: number | undefined }

export async function signIn(
  email: string,
  password: string,
  rememberMe = true,
): Promise<AuthOutcome> {
  const { error } = await authClient.signIn.email({
    email,
    password,
    rememberMe,
  })
  if (error) {
    return { ok: false, status: error.status }
  }
  return { ok: true }
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthOutcome> {
  const { error } = await authClient.signUp.email({ name, email, password })
  if (error) {
    return { ok: false, status: error.status }
  }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  await authClient.signOut()
}

export function getSession() {
  return authClient.getSession()
}
