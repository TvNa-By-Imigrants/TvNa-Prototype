import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/i18n'
import { PermissionsProvider } from '@/lib/permissions'
import { PlanProvider } from '@/lib/plan-context'
import { AppShell } from '@/components/shell'

function RootLayout() {
  return (
    <LanguageProvider>
      <PermissionsProvider>
        <PlanProvider>
          <ScrollRestoration />
          <AppShell>
            <Outlet />
          </AppShell>
          <Toaster richColors position="bottom-right" />
          <TanStackRouterDevtools />
        </PlanProvider>
      </PermissionsProvider>
    </LanguageProvider>
  )
}

export const Route = createRootRoute({ component: RootLayout })
