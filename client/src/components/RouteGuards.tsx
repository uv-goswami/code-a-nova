import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/Card';

/** JWT guard for private pages: sends visitors to /login and remembers where they wanted to go. */
export function ProtectedRoute() {
  const { user, loading, signedOut } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Checking your session" />;
  // Clicked Logout -> Home. Never logged in, or session expired -> Login (and remember the page).
  if (!user && signedOut) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login/Signup make no sense when already signed in. */
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
