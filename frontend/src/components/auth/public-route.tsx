'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  showLoading?: boolean;
}

export function PublicRoute({
  children,
  redirectPath = '/dashboard',
  showLoading = true,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, redirectPath]);

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

  // Don't render children if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component version for easier usage
export function withPublicRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<PublicRouteProps, 'children'>
) {
  return function PublicComponent(props: P) {
    return (
      <PublicRoute {...options}>
        <Component {...props} />
      </PublicRoute>
    );
  };
}