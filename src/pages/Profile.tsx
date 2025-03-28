
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      const userRole = user?.user_metadata?.role || 'student';
      
      if (userRole === 'teacher') {
        navigate('/educator-profile');
      } else if (userRole === 'student') {
        navigate('/student-profile');
      }
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-edu-dark text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-edu-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />

        <div className="bg-card rounded-xl p-6 mt-8">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          
          {user && (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground text-sm">Role</p>
                <p className="font-medium capitalize">{user.user_metadata?.role || 'student'}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-muted"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
