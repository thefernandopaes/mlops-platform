'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import authService from '@/lib/auth-service';
import { AuthUser, AuthContextType, AuthenticationError } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userProfile = await authService.getCurrentUser();
        const authUser = authService.transformUserProfile(userProfile);
        setUser(authUser);
      }
    } catch (error) {
      console.warn('Failed to initialize auth:', error);
      authService.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login(email, password);
      const authUser = authService.transformUserProfile(authResponse.user);
      
      setUser(authUser);
      toast.success(`Welcome back, ${authUser.firstName}!`);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.register(data);
      const authUser = authService.transformUserProfile(authResponse.user);
      
      setUser(authUser);
      toast.success(`Welcome to MLOps Platform, ${authUser.firstName}!`);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.warn('Logout error:', error);
      // Clear local state even if server call fails
      setUser(null);
      authService.clearTokens();
      router.push('/auth/login');
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      // Optionally refresh user data
      if (user) {
        const userProfile = await authService.getCurrentUser();
        const authUser = authService.transformUserProfile(userProfile);
        setUser(authUser);
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      setUser(null);
      authService.clearTokens();
      router.push('/auth/login');
    }
  }, [user, router]);

  const hasRole = useCallback((role: 'admin' | 'developer' | 'viewer'): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const hasMinimumRole = useCallback((role: 'admin' | 'developer' | 'viewer'): boolean => {
    if (!user) return false;
    
    const roleHierarchy = { viewer: 1, developer: 2, admin: 3 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[role];
    
    return userRoleLevel >= requiredRoleLevel;
  }, [user]);

  const value: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    
    // Utilities
    hasRole,
    hasMinimumRole,
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