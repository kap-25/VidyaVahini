
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrivateRouteProps {
  children: React.ReactNode;
  publicRoute?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, publicRoute = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Set a timeout to show the loading state for a minimum time
    // to avoid flickering for fast connections
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [user, loading]);

  useEffect(() => {
    // Show authentication errors
    if (!loading && !user && !publicRoute) {
      toast.error('Authentication required. Please sign in.', {
        id: 'auth-required',
        duration: 3000,
      });
    }
  }, [loading, user, publicRoute, location.pathname]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-dark">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-edu-purple animate-spin mb-4" />
          <p className="text-edu-purple text-lg font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user && !publicRoute) {
    // Save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
