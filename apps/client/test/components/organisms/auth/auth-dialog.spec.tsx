import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthDialog } from '@/components/organisms/auth/auth-dialog'
import { LanguageProvider } from '@/i18n'
import { appEn } from '@/i18n/app-en'
import { NAME_MAX_LENGTH } from '@/lib/validations/auth'

const signInMock = vi.fn()
const signUpMock = vi.fn()
const toastError = vi.fn()

vi.mock('@/lib/auth', () => ({
  signIn: (email: string, password: string, rememberMe: boolean) =>
    signInMock(email, password, rememberMe),
  signUp: (name: string, email: string, password: string) =>
    signUpMock(name, email, password),
}))

vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}))

const noop = () => {}

// The provider defaults to Khmer; assert against the English copy.
beforeEach(() => {
  localStorage.setItem('tvna-language', 'en')
})

function renderDialog(mode: 'login' | 'register' = 'login') {
  const onSignedIn = vi.fn()
  render(
    <LanguageProvider>
      <AuthDialog
        open
        mode={mode}
        onOpenChange={noop}
        onSignedIn={onSignedIn}
      />
    </LanguageProvider>,
  )
  return { onSignedIn }
}

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
  await user.type(screen.getByLabelText(/^password/i), 'password123')
}

describe('AuthDialog', () => {
  beforeEach(() => {
    signInMock.mockReset()
    signUpMock.mockReset()
    toastError.mockReset()
  })

  it('signs in, passes Remember me, and reports success', async () => {
    signInMock.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    const { onSignedIn } = renderDialog('login')

    await fillLogin(user)
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(
        'admin@example.com',
        'password123',
        true,
      ),
    )
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
  })

  it('shows a localized toast and field error on invalid credentials', async () => {
    signInMock.mockResolvedValue({ ok: false, status: 401 })
    const user = userEvent.setup()
    const { onSignedIn } = renderDialog('login')

    await fillLogin(user)
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(toastError.mock.calls[0][1].description).toMatch(
      /doesn't match an account/i,
    )
    expect(onSignedIn).not.toHaveBeenCalled()
    expect(
      (screen.getByLabelText(/email/i) as HTMLInputElement).value,
    ).toBe('admin@example.com')
  })

  it('keeps submit disabled while the request is pending', async () => {
    let resolveSignIn: (value: { ok: true }) => void = () => {}
    signInMock.mockImplementation(
      () =>
        new Promise<{ ok: true }>((resolve) => {
          resolveSignIn = resolve
        }),
    )
    const user = userEvent.setup()
    renderDialog('login')

    await fillLogin(user)
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    const pending = screen.getByRole('button', { name: /please wait/i })
    expect((pending as HTMLButtonElement).disabled).toBe(true)

    resolveSignIn({ ok: true })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy(),
    )
  })

  it('blocks submit on an invalid email and short password', async () => {
    const user = userEvent.setup()
    renderDialog('login')

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/^password/i), 'short')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(signInMock).not.toHaveBeenCalled()
    expect(screen.getByText(/valid email address/i)).toBeTruthy()
    expect(screen.getByText(/at least 8 characters/i)).toBeTruthy()
    // One toast per failed submit, since the field errors are hidden on mobile.
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastError.mock.calls[0][0]).toMatch(/check your details/i)
  })

  it('rejects a name with symbols or digits', async () => {
    const user = userEvent.setup()
    renderDialog('register')

    await user.type(screen.getByLabelText(appEn.auth.name), 'Sok <b>98</b>')
    await user.type(screen.getByLabelText(/email/i), 'dara@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('checkbox', { name: /terms of use/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(signUpMock).not.toHaveBeenCalled()
    expect(screen.getByText(appEn.auth.errNameInvalid)).toBeTruthy()
  })

  it('accepts Khmer names and caps the field at the name limit', async () => {
    signUpMock.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderDialog('register')

    const nameInput = screen.getByLabelText(appEn.auth.name) as HTMLInputElement
    expect(nameInput.maxLength).toBe(NAME_MAX_LENGTH)

    // Khmer letters carry combining marks; the pattern must allow them.
    await user.type(nameInput, 'សុខ ដារា')
    await user.type(screen.getByLabelText(/email/i), 'dara@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('checkbox', { name: /terms of use/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith(
        'សុខ ដារា',
        'dara@example.com',
        'password123',
      ),
    )
  })

  it('rejects mismatched passwords on register', async () => {
    const user = userEvent.setup()
    renderDialog('register')

    await user.type(screen.getByLabelText(appEn.auth.name), 'Sok Dara')
    await user.type(screen.getByLabelText(/email/i), 'dara@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password124')
    await user.click(screen.getByRole('checkbox', { name: /terms of use/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(signUpMock).not.toHaveBeenCalled()
    expect(screen.getByText(/passwords don't match/i)).toBeTruthy()
    expect(toastError).toHaveBeenCalledTimes(1)
  })

  it('creates an account and reports success', async () => {
    signUpMock.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    const { onSignedIn } = renderDialog('register')

    await user.type(screen.getByLabelText(appEn.auth.name), 'Sok Dara')
    await user.type(screen.getByLabelText(/email/i), 'dara@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('checkbox', { name: /terms of use/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith(
        'Sok Dara',
        'dara@example.com',
        'password123',
      ),
    )
    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
  })

  it('surfaces a duplicate email on register', async () => {
    signUpMock.mockResolvedValue({ ok: false, status: 422 })
    const user = userEvent.setup()
    renderDialog('register')

    await user.type(screen.getByLabelText(appEn.auth.name), 'Sok Dara')
    await user.type(screen.getByLabelText(/email/i), 'dara@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('checkbox', { name: /terms of use/i }))
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(toastError.mock.calls[0][1].description).toMatch(/already registered/i)
  })

  it('switches between sign-in and sign-up', async () => {
    const user = userEvent.setup()
    renderDialog('login')

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByLabelText(appEn.auth.name)).toBeTruthy()
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy()
  })

  it('opens the form for the mode it was reopened with', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [mode, setMode] = useState<'login' | 'register' | null>(null)
      return (
        <>
          <button type="button" onClick={() => setMode('login')}>
            open login
          </button>
          <button type="button" onClick={() => setMode('register')}>
            open register
          </button>
          <AuthDialog
            open={mode !== null}
            mode={mode ?? 'login'}
            onOpenChange={(next) => {
              if (!next) setMode(null)
            }}
          />
        </>
      )
    }

    render(
      <LanguageProvider>
        <Harness />
      </LanguageProvider>,
    )

    await user.click(screen.getByRole('button', { name: /open login/i }))
    expect(screen.queryByLabelText(appEn.auth.name)).toBeNull()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByLabelText(/email/i)).toBeNull())

    // The shell keeps the dialog mounted, so a stale mode would show login here.
    await user.click(screen.getByRole('button', { name: /open register/i }))
    expect(screen.getByLabelText(appEn.auth.name)).toBeTruthy()
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy()
  })
})
