// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '@/config/firbaseConfig';

const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
