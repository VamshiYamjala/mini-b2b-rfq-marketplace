import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage message="Authorizing..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect user to their own role dashboard if trying to access unauthorized role route
    const destination = user?.role === 'BUYER' ? '/buyer' : '/supplier';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RoleRoute;
