'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  organizationId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token and get user info
      // For now, just set loading to false
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement login API call
    console.log('Login:', email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (email: string, password: string, fullName: string) => {
    // TODO: Implement register API call
    console.log('Register:', email, password, fullName);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}