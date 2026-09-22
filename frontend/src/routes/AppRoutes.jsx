import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleRoute from './RoleRoute';
import Spinner from '../components/Spinner';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Buyer Pages
import BuyerDashboard from '../pages/BuyerDashboard';
import CreateRfq from '../pages/CreateRfq';
import EditRfq from '../pages/EditRfq';
import RfqDetailBuyer from '../pages/RfqDetailBuyer';

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

      {/* Buyer Protected Routes - Level 11 */}
      <Route
        path="/buyer"
        element={
          <RoleRoute allowedRoles={['BUYER']}>
            <BuyerDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/create"
        element={
          <RoleRoute allowedRoles={['BUYER']}>
            <CreateRfq />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/rfq/:id"
        element={
          <RoleRoute allowedRoles={['BUYER']}>
            <RfqDetailBuyer />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/rfq/:id/edit"
        element={
          <RoleRoute allowedRoles={['BUYER']}>
            <EditRfq />
          </RoleRoute>
        }
      />

      {/* Supplier Routes placeholder - Level 12 */}
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
