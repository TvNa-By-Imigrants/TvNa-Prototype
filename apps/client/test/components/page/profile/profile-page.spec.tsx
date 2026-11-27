import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProfilePage } from '@/components/page/profile'
import { LanguageProvider } from '@/i18n'
import { appEn } from '@/i18n/app-en'
import { ProfileProvider } from '@/lib/profile-context'

const navigate = vi.fn()
const session = vi.hoisted(() => ({ user: null as unknown }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
  useNavigate: () => navigate,
}))

vi.mock('@/lib/permissions', () => ({
  usePermissions: () => ({
    user: session.user,
    permissions: [],
    isLoading: false,
    has: () => false,
    refresh: vi.fn(),
  }),
}))

function renderProfile(handle: string) {
  return render(
    <LanguageProvider>
      <ProfileProvider>
        <ProfilePage handle={handle} />
      </ProfileProvider>
    </LanguageProvider>,
  )
}

beforeEach(() => {
  localStorage.setItem('tvna-language', 'en')
  session.user = null
  navigate.mockReset()
})

describe('ProfilePage', () => {
  it('shows the owner CTA, derived posts, and a Saved Plans tab', async () => {
    session.user = { id: 'u1', name: 'Dara' }
    const user = userEvent.setup()
    renderProfile('dara')

    expect(screen.getByRole('button', { name: appEn.profile.editProfile })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Saved Plans/i })).toBeTruthy()
    expect(screen.getByText('klengofvitage - Russian Market Thrift')).toBeTruthy()
    expect(screen.getByText('Kaixin Hotpot with the Squad')).toBeTruthy()

    await user.click(screen.getByRole('tab', { name: /Saved Plans/i }))
    expect(screen.getByText(appEn.profile.privateNote)).toBeTruthy()
    expect(screen.getByText('Weekend in Phnom Penh')).toBeTruthy()
  })

  it('hides Saved Plans for a visitor and toggles Follow locally', async () => {
    const user = userEvent.setup()
    renderProfile('sophea')

    expect(screen.queryByRole('tab', { name: /Saved Plans/i })).toBeNull()
    expect(screen.getByRole('button', { name: appEn.profile.follow })).toBeTruthy()
    expect(screen.getByRole('button', { name: appEn.profile.back })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: appEn.profile.follow }))
    expect(screen.getByRole('button', { name: appEn.profile.following })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: appEn.profile.back }))
    expect(navigate).toHaveBeenCalledWith({ to: '/' })
  })
})
