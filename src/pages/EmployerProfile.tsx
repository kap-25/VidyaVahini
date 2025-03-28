
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Briefcase, User, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import T from '@/components/T';

const EmployerProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total jobs
      const { data: jobsData, error: jobsError, count: jobsCount } = await supabase
        .from('job_materials')
        .select('*', { count: 'exact' })
        .eq('created_by', user?.id);

      if (jobsError) throw jobsError;
      
      // Get total applications
      const { data: applicationsData, error: applicationsError, count: applicationsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact' })
        .in('job_id', jobsData?.map(job => job.id) || []);
        
      if (applicationsError) throw applicationsError;
      
      // Get unread notifications
      const { data: notificationsData, error: notificationsError, count: unreadNotificationsCount } = await supabase
        .from('employer_notifications')
        .select('*', { count: 'exact' })
        .eq('employer_id', user?.id)
        .eq('read', false);
        
      if (notificationsError) throw notificationsError;
      
      setStats({
        totalJobs: jobsCount || 0,
        totalApplications: applicationsCount || 0,
        unreadNotifications: unreadNotificationsCount || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/main');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header showBackButton={true} />

        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold mb-6"><T>Employer Profile</T></h1>

          <div className="flex flex-col space-y-6">
            <Card className="bg-edu-card-bg border-edu-card-border text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl"><T>Account Information</T></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-edu-purple" />
                    <div>
                      <p className="text-sm text-gray-400"><T>Username</T></p>
                      <p>{profile?.username || user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-edu-purple" />
                    <div>
                      <p className="text-sm text-gray-400"><T>Role</T></p>
                      <p><T>Employer</T></p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-edu-purple" />
                    <div>
                      <p className="text-sm text-gray-400"><T>Email</T></p>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-edu-card-bg border-edu-card-border text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl"><T>Activity</T></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-edu-purple" />
                      <p><T>Job Postings</T></p>
                    </div>
                    <span className="bg-edu-purple/20 text-edu-purple px-2 py-1 rounded-full text-sm">
                      {stats.totalJobs}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5 text-edu-purple" />
                      <p><T>Applications</T></p>
                    </div>
                    <span className="bg-edu-purple/20 text-edu-purple px-2 py-1 rounded-full text-sm">
                      {stats.totalApplications}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-edu-purple" />
                      <p><T>Notifications</T></p>
                    </div>
                    <span className="bg-edu-purple/20 text-edu-purple px-2 py-1 rounded-full text-sm">
                      {stats.unreadNotifications}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-edu-card-border hover:bg-edu-purple/20"
                    onClick={() => navigate('/jobs')}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    <T>Manage Job Postings</T>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-edu-card-border hover:bg-edu-purple/20"
                    onClick={() => navigate('/employer-notifications')}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    <T>View Notifications</T>
                    {stats.unreadNotifications > 0 && (
                      <span className="ml-2 bg-edu-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {stats.unreadNotifications}
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="destructive" 
              className="w-full mt-4" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <T>Sign Out</T>
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EmployerProfile;
