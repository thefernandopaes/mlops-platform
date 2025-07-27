'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'developer' | 'viewer';
  fallbackPath?: string;
  showLoading?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/auth/login',
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasMinimumRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRole && !hasMinimumRole(requiredRole)) {
        // Redirect to unauthorized page or dashboard
        router.push('/dashboard?error=unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, hasMinimumRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    if (!showLoading) return null;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasMinimumRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component version for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Role-specific protection components
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallbackPath="/dashboard?error=admin-required">
      {children}
    </ProtectedRoute>
  );
}

export function DeveloperRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="developer" fallbackPath="/dashboard?error=developer-required">
      {children}
    </ProtectedRoute>
  );
}

export function ViewerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="viewer">
      {children}
    </ProtectedRoute>
  );
}