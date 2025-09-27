import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/stores/useAuth';
import { AUTH_ENABLED } from '@/config';

export default function Protected() {
  if (!AUTH_ENABLED) return <Outlet />;       // bypass while building
  const { token, user } = useAuth();
  return token || user ? <Outlet /> : <Navigate to="/login" replace />;
}
