import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext'; // Updated path matching context setup

export default function AdminProtectedRoute() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080c14]">
        <div className="text-xs font-mono tracking-widest text-[#3d5070] animate-pulse">
          AUTHENTICATING SECURITY CLEARANCE...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}