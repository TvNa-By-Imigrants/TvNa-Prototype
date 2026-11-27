import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from '@tanstack/react-router';
import type { SessionUser } from '@repo/contracts';
import { apiRequest, AUTH_UNAUTHORIZED_EVENT } from './api';
import { openAuthDialog } from './auth-dialog';

export type { SessionUser };

export interface PermissionsValue {
  user: SessionUser | null;
  permissions: readonly string[];
  isLoading: boolean;
  has: (permission: string) => boolean;
  /** Re-reads the session. Call after sign-in / sign-up so the header updates. */
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ user: SessionUser }>('/api/me', {
        redirectOnUnauthorized: false,
      });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    setIsLoading(true);

    apiRequest<{ user: SessionUser }>('/api/me', {
      redirectOnUnauthorized: false,
    })
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    // A dead session asks for the dialog instead of reloading into a page, so
    // the user keeps their place (and the trip stops held in memory).
    const onUnauthorized = () => {
      setUser(null);
      openAuthDialog('login');
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const value = useMemo<PermissionsValue>(() => {
    const permissions = user?.permissions ?? [];
    return {
      user,
      permissions,
      isLoading,
      has: (permission: string) => permissions.includes(permission),
      refresh,
    };
  }, [user, isLoading, refresh]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsValue {
  const value = useContext(PermissionsContext);
  if (!value) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return value;
}
