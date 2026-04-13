import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'guest' | 'bgh';

interface AuthContextType {
  role: UserRole;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isBGH: boolean;
}

const BGH_USERNAME = 'ngovannamnbk';
const BGH_PASSWORD = 'ngovannam@123';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem('edu_role') as UserRole) || 'guest';
  });

  const login = useCallback((username: string, password: string): boolean => {
    if (username === BGH_USERNAME && password === BGH_PASSWORD) {
      setRole('bgh');
      sessionStorage.setItem('edu_role', 'bgh');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setRole('guest');
    sessionStorage.removeItem('edu_role');
  }, []);

  return (
    <AuthContext.Provider value={{ role, login, logout, isBGH: role === 'bgh' }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
