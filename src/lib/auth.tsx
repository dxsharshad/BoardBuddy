import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, getIdTokenResult, type User } from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';

type AuthState = { configured: boolean; loading: boolean; user: User | null; isAdmin: boolean; isTeacher: boolean; refreshClaims: () => Promise<void> };
const AuthContext = createContext<AuthState>({ configured: false, loading: false, user: null, isAdmin: false, isTeacher: false, refreshClaims: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(firebaseConfigured));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const refreshClaims = async () => {
    if (!auth?.currentUser) { setIsAdmin(false); setIsTeacher(false); return; }
    const result = await getIdTokenResult(auth.currentUser, true);
    setIsAdmin(result.claims.admin === true || result.claims.role === 'admin');
    setIsTeacher(result.claims.teacher === true || result.claims.role === 'teacher');
  };
  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) { setIsAdmin(false); setIsTeacher(false); setLoading(false); return; }
      try {
        const result = await getIdTokenResult(nextUser, true);
        setIsAdmin(result.claims.admin === true || result.claims.role === 'admin');
        setIsTeacher(result.claims.teacher === true || result.claims.role === 'teacher');
      } catch { setIsAdmin(false); setIsTeacher(false); }
      setLoading(false);
    });
  }, []);
  const value = useMemo(() => ({ configured: firebaseConfigured, loading, user, isAdmin, isTeacher, refreshClaims }), [loading, user, isAdmin, isTeacher]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
