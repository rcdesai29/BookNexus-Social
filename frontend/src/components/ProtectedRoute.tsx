import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenService } from '../services/tokenService';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!tokenService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute; 