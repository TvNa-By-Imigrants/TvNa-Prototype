import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from '@/components/shell/app-shell'
import { LanguageProvider } from '@/i18n'
import { signOut } from '@/lib/auth'
import { openAuthDialog } from '@/lib/auth-dialog'
import { appEn } from '@/i18n/app-en'

const navigate = vi.fn()
const refresh = vi.fn()
const authOnly = vi.hoisted(() => ({ value: false }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => navigate,
  useRouterState: (opts?: { select?: (s: unknown) => unknown }) =>
    opts?.select
      ? opts.select({
          matches: [
            { routeId: authOnly.value ? '/_authenticated/pokemon' : '/' },
          ],
        })
      : {},
}))

vi.mock('@/lib/auth', () => ({ signOut: vi.fn() }))

const session = vi.hoisted(() => ({
  user: { id: 'u1', name: 'Sok', email: 'sok@b.test' } as unknown,
}))

vi.mock('@/lib/permissions', () => ({
  usePermissions: () => ({
    user: session.user,
    permissions: [],
    isLoading: false,
    has: () => false,
    refresh,
  }),
}))

const mockedSignOut = vi.mocked(signOut)

function renderShell() {
  return render(
    <LanguageProvider>
      <AppShell>
        <p>page content</p>
      </AppShell>
    </LanguageProvider>,
  )
}

/** Open the logout dialog from the signed-in header, then confirm. */
async function confirmSignOut(user: ReturnType<typeof userEvent.setup>) {
  // The header button is labelled with the user's name.
  // The header mounts twice (mobile + desktop rows).
  await user.click(screen.getAllByRole('button', { name: /Sok/ })[0])
  await user.click(
    await screen.findByRole('button', { name: appEn.auth.logoutConfirm }),
  )
}

describe('AppShell auth dialogs', () => {
  beforeEach(() => {
    localStorage.setItem('tvna-language', 'en')
    navigate.mockReset()
    refresh.mockReset().mockResolvedValue(undefined)
    mockedSignOut.mockReset().mockResolvedValue(undefined)
    authOnly.value = false
  })

  it('opens the dialog from a request without navigating', async () => {
    renderShell()

    openAuthDialog('register')

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain('Create your account')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('stays on the page after signing out of an ordinary route', async () => {
    const user = userEvent.setup()
    renderShell()

    await confirmSignOut(user)

    await waitFor(() => expect(mockedSignOut).toHaveBeenCalled())
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByText('page content')).toBeTruthy()
  })

  it('leaves a signed-in-only page, which cannot render without a session', async () => {
    authOnly.value = true
    const user = userEvent.setup()
    renderShell()

    await confirmSignOut(user)

    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/' }))
  })
})
