import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * A simple higher-order component that restricts access to routes 
 * based on authentication status and required role clearance.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated, tracking return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect back home if they lack permission clearanc
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
