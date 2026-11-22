import { createRootRoute, Outlet, ScrollRestoration, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/i18n'
import { PermissionsProvider } from '@/lib/permissions'
import { AppShell } from '@/components/shell'

function RootLayout() {
  const isSignIn = useRouterState({
    select: (s) => s.location.pathname === '/sign-in',
  })

  return (
    <LanguageProvider>
      <PermissionsProvider>
        <ScrollRestoration />
        {isSignIn ? (
          <Outlet />
        ) : (
          <AppShell>
            <Outlet />
          </AppShell>
        )}
        <Toaster richColors position="top-right" />
        <TanStackRouterDevtools />
      </PermissionsProvider>
    </LanguageProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
