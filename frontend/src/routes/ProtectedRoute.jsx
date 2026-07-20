import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route by authentication and (optionally) allowed roles.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-forest-500">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
