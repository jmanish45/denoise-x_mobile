/**
 * AuthContext.tsx — Shared Authentication State
 * ================================================
 * Provides loggedIn state to the entire app so that _layout.tsx
 * can react immediately when the user signs in or signs up.
 *
 * Without this, the root layout only checks auth once at startup
 * and doesn't know when the user authenticates — causing a redirect
 * loop back to the welcome screen.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { isAuthenticated as checkAuth } from './auth';

interface AuthContextType {
  /** Whether the user is currently logged in */
  loggedIn: boolean;
  /** Call this after successful sign-in to update the global auth state */
  setLoggedIn: (value: boolean) => void;
  /** Re-check auth state from SecureStore (e.g., on app resume) */
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
  refreshAuth: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);

  const refreshAuth = useCallback(async () => {
    const authed = await checkAuth();
    setLoggedIn(authed);
    return authed;
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
