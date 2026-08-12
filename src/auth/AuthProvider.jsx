import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useBrand } from '@/hooks/useBrand';

const STORAGE_KEY = 'cf.auth';

function readStoredAuth() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * A demo login gate, not real auth — there is no backend. Credentials are
 * checked against the active tenant's `content.demoUsername` /
 * `demoPassword` (see src/brand/brands), so each tenant shows its own creds
 * on the sign-in screen without this file knowing which tenant is active.
 *
 * Session-scoped on purpose: closing the tab should ask again, the same way
 * a real portal would.
 */
export function AuthProvider({ children }) {
  const { brand } = useBrand();
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth);

  const login = useCallback(
    (username, password) => {
      const ok =
        username.trim() === brand.content?.demoUsername && password === brand.content?.demoPassword;
      if (ok) {
        setIsAuthenticated(true);
        try {
          window.sessionStorage.setItem(STORAGE_KEY, 'true');
        } catch {
          /* private mode — the session still applies for this tab */
        }
      }
      return ok;
    },
    [brand],
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
