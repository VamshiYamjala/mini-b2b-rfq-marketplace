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

// Supplier Pages
import SupplierDashboard from '../pages/SupplierDashboard';
import RfqDetailSupplier from '../pages/RfqDetailSupplier';
import MyQuotations from '../pages/MyQuotations';

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

      {/* Supplier Protected Routes - Level 12 */}
      <Route
        path="/supplier"
        element={
          <RoleRoute allowedRoles={['SUPPLIER']}>
            <SupplierDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier/rfq/:id"
        element={
          <RoleRoute allowedRoles={['SUPPLIER']}>
            <RfqDetailSupplier />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier/my-quotations"
        element={
          <RoleRoute allowedRoles={['SUPPLIER']}>
            <MyQuotations />
          </RoleRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
