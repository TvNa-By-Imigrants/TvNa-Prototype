import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PermissionsProvider, usePermissions } from '@/lib/permissions'

const routerLocation = vi.hoisted(() => ({ pathname: '/' }))

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => routerLocation,
}))

function Consumer() {
  const { has, user, isLoading } = usePermissions()
  if (isLoading) return <span data-testid="state">loading</span>
  return (
    <span data-testid="state">
      {`${user?.role}:${has('pokemon:read')}:${has('user:list')}`}
    </span>
  )
}

function mockMe(me: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(me ? { user: me } : null),
    }),
  )
}

describe('PermissionsProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    routerLocation.pathname = '/'
  })

  it('loads permissions from the REST session endpoint', async () => {
    mockMe({
      id: 'u1',
      name: 'Ops',
      email: 'ops@b.test',
      role: 'user',
      permissions: ['pokemon:read'],
    })

    render(
      <PermissionsProvider>
        <Consumer />
      </PermissionsProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('state').textContent).toBe('user:true:false'),
    )
  })

  it('treats an unauthenticated response as no permissions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ code: 'UNAUTHORIZED', statusCode: 401 }),
      }),
    )

    render(
      <PermissionsProvider>
        <Consumer />
      </PermissionsProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('state').textContent).toBe(
        'undefined:false:false',
      ),
    )
  })

  it('asks for the dialog instead of reloading when the session dies', async () => {
    mockMe(null)
    const dispatch = vi.spyOn(window, 'dispatchEvent')

    render(
      <PermissionsProvider>
        <Consumer />
      </PermissionsProvider>,
    )

    await waitFor(() =>
      expect(screen.getByTestId('state').textContent).toBe(
        'undefined:false:false',
      ),
    )

    window.dispatchEvent(new Event('auth:unauthorized'))

    // No page navigation: the dialog is the only auth surface.
    await waitFor(() =>
      expect(dispatch.mock.calls.some(([e]) => e.type === 'auth:open-dialog')).toBe(
        true,
      ),
    )
    dispatch.mockRestore()
  })
})
