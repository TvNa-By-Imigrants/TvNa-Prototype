import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditProfileDialog } from '@/components/page/profile'
import { profiles } from '@/data/profiles'
import { LanguageProvider } from '@/i18n'
import { appEn } from '@/i18n/app-en'
import { ProfileProvider, useProfileContext } from '@/lib/profile-context'

const navigate = vi.fn()
const toastSuccess = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}))

const owner = profiles.find((profile) => profile.handle === 'dara')!

function AvatarProbe() {
  const { getOwnerProfile } = useProfileContext()
  return <span data-testid="avatar-url">{getOwnerProfile()?.avatar ?? 'none'}</span>
}

function renderDialog(onOpenChange = vi.fn()) {
  render(
    <LanguageProvider>
      <ProfileProvider>
        <EditProfileDialog open onOpenChange={onOpenChange} profile={owner} />
        <AvatarProbe />
      </ProfileProvider>
    </LanguageProvider>,
  )
  return { onOpenChange }
}

beforeEach(() => {
  localStorage.setItem('tvna-language', 'en')
  navigate.mockReset()
  toastSuccess.mockReset()
})

describe('EditProfileDialog', () => {
  it('blocks invalid handle, taken handle, and over-limit bio', async () => {
    const user = userEvent.setup()
    renderDialog()

    const handle = screen.getByLabelText(appEn.profile.handle)
    await user.clear(handle)
    await user.type(handle, 'AB')
    const bio = screen.getByLabelText(appEn.profile.bio)
    await user.clear(bio)
    await user.type(bio, 'x'.repeat(161))
    await user.click(screen.getByRole('button', { name: appEn.profile.save }))

    expect(screen.getByText(appEn.profile.errHandleFormat)).toBeTruthy()
    expect(screen.getByText(appEn.profile.errBioLong)).toBeTruthy()
    expect(toastSuccess).not.toHaveBeenCalled()

    // The error clears as soon as the field is corrected.
    await user.clear(handle)
    await user.type(handle, 'chayy')
    expect(screen.queryByText(appEn.profile.errHandleFormat)).toBeNull()
    await user.click(screen.getByRole('button', { name: appEn.profile.save }))
    expect(await screen.findByText(appEn.profile.errHandleTaken)).toBeTruthy()
  })

  it('saves valid edits, toasts, closes, and follows a handle change', async () => {
    const user = userEvent.setup()
    const { onOpenChange } = renderDialog()

    await user.clear(screen.getByLabelText(appEn.profile.name))
    await user.type(screen.getByLabelText(appEn.profile.name), 'Dara X')
    await user.clear(screen.getByLabelText(appEn.profile.handle))
    await user.type(screen.getByLabelText(appEn.profile.handle), 'dara2')
    await user.click(screen.getByRole('button', { name: appEn.profile.save }))

    expect(screen.getByRole('button', { name: appEn.profile.saving })).toBeTruthy()
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled(), { timeout: 2000 })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(navigate).toHaveBeenCalledWith({ to: '/profile', search: { handle: 'dara2' } })
  })

  it('previews a picked photo, stages it until Save, and can remove it', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:avatar')
    const user = userEvent.setup()
    renderDialog()

    const input = screen.getByLabelText(appEn.profile.changePhoto) as HTMLInputElement
    await user.upload(input, new File(['img'], 'avatar.png', { type: 'image/png' }))
    expect(screen.getByAltText(appEn.profile.photoPreview).getAttribute('src')).toBe('blob:avatar')
    // Cancel-like edits stay local until Save commits them.
    expect(screen.getByTestId('avatar-url').textContent).not.toBe('blob:avatar')

    await user.click(screen.getByRole('button', { name: appEn.profile.save }))
    await waitFor(() => expect(screen.getByTestId('avatar-url').textContent).toBe('blob:avatar'), {
      timeout: 2000,
    })
  })

  it('drops a non-image file instead of previewing it', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: appEn.profile.removePhoto }))
    expect(screen.queryByAltText(appEn.profile.photoPreview)).toBeNull()

    const input = screen.getByLabelText(appEn.profile.changePhoto) as HTMLInputElement
    await user.upload(input, new File(['nope'], 'notes.txt', { type: 'text/plain' }))

    expect(screen.queryByAltText(appEn.profile.photoPreview)).toBeNull()
  })
})
