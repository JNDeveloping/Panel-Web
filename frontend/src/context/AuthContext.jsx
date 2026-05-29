import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  async function signIn(username, password) { const { data } = await api.post('/auth/login', { username, password }); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); setToken(data.token); setUser(data.user); }
  function signOut() { localStorage.clear(); setToken(null); setUser(null); }
  const value = useMemo(() => ({ token, user, signIn, signOut, authenticated: Boolean(token) }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
