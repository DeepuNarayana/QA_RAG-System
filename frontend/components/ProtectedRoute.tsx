import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
}

/**
 * ProtectedRoute component to guard routes that require authentication
 * Redirects unauthenticated users to /auth/login
 * Redirects users without required role to home page
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading auth state

    if (!isAuthenticated) {
      // Redirect to login, but save the current path to redirect back after auth
      router.push(`/auth/login?from=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Check role-based access
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/');
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
