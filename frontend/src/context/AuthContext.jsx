import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const getTokenPayload = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const isAuthenticated = !!token;
  const payload = getTokenPayload(token);
  const role = payload?.role || null;
  const currentUserEmail = payload?.sub || null;
  const isAdmin = role === 'ADMIN';

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, role, isAdmin, currentUserEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
