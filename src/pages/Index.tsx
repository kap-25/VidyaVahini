
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainIndex from './MainIndex';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading) return;
    
    if (user) {
      const userRole = user?.user_metadata?.role || 'student';
      
      if (userRole === 'teacher') {
        navigate('/educator', { replace: true });
      } else if (userRole === 'employer') {
        navigate('/employer', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-edu-dark">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-edu-purple animate-spin mb-4" />
          <p className="text-edu-purple text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not logged in, show the main index page
  return <MainIndex />;
};

export default Index;
