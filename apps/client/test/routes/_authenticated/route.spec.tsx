import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSession } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/auth-dialog', () => ({
  openAuthDialog: vi.fn(),
}))

vi.mock('@/lib/permissions', () => ({
  usePermissions: () => ({
    user: null,
    permissions: [],
    isLoading: false,
    has: () => false,
  }),
}))

import { openAuthDialog } from '@/lib/auth-dialog'
import { Route } from '@/routes/_authenticated/route'

const mockedGetSession = vi.mocked(getSession)
const beforeLoad = Route.options.beforeLoad as unknown as (opts: {
  location: { pathname: string }
}) => Promise<unknown>

async function runGuard(pathname: string): Promise<unknown> {
  try {
    return await beforeLoad({ location: { pathname } })
  } catch (error) {
    return error
  }
}

describe('authenticated layout guard', () => {
  beforeEach(() => {
    mockedGetSession.mockReset()
  })

  it('sends a signed-out visitor home and asks for the dialog', async () => {
    mockedGetSession.mockResolvedValue({ data: null } as never)

    const result = (await runGuard('/Driver-list')) as {
      options?: { to?: string }
    }

    expect(result.options).toMatchObject({ to: '/' })
    expect(openAuthDialog).toHaveBeenCalledWith('login')
  })

  it('allows a signed-in visitor through', async () => {
    mockedGetSession.mockResolvedValue({
      data: { session: { id: 's1' }, user: { id: 'u1' } },
    } as never)

    const result = await runGuard('/')

    expect(result).toBeUndefined()
  })
})
