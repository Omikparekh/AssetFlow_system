import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, Role } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>; // TODO: Replace with global skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PermissionRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>; 
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (user && user.role === 'EMPLOYEE') {
      return <Navigate to="/assets" replace />;
    }
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
