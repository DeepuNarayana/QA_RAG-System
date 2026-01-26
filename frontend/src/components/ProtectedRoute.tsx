/**
 * ProtectedRoute Component
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuthStore();

  // Initialize auth from storage on mount
  React.useEffect(() => {
    const authStore = useAuthStore.getState();
    authStore.initializeFromStorage();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
