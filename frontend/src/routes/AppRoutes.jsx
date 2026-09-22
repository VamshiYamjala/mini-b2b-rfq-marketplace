import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import Spinner from '../components/Spinner';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'BUYER' ? '/buyer' : '/supplier'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Buyer Routes placeholder */}
      <Route
        path="/buyer/*"
        element={
          <RoleRoute allowedRoles={['BUYER']}>
            <div className="container py-5"><h3>Buyer Dashboard Shell</h3></div>
          </RoleRoute>
        }
      />

      {/* Supplier Routes placeholder */}
      <Route
        path="/supplier/*"
        element={
          <RoleRoute allowedRoles={['SUPPLIER']}>
            <div className="container py-5"><h3>Supplier Dashboard Shell</h3></div>
          </RoleRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
