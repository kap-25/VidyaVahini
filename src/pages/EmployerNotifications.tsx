
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import EmployerNotificationCard from '@/components/jobs/EmployerNotificationCard';
import { useNavigate } from 'react-router-dom';
import T from '@/components/T';

type Notification = {
  id: string;
  job_id: string;
  student_id: string;
  message: string;
  read: boolean;
  created_at: string;
  job?: {
    title: string;
    company: string;
  };
  student?: {
    username: string;
    email: string;
  };
};

const EmployerNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employer_notifications')
        .select(`
          *,
          job:job_id(title, company),
          student:student_id(username, email)
        `)
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Notification type
      const transformedData = data?.map((item: any) => ({
        ...item,
        job: item.job,
        student: item.student
      })) || [];
      
      setNotifications(transformedData);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employer_notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      toast.success('Notification marked as read');
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        toast.info('No unread notifications');
        return;
      }
      
      const { error } = await supabase
        .from('employer_notifications')
        .update({ read: true })
        .eq('employer_id', user?.id)
        .eq('read', false);

      if (error) throw error;
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success(`${unreadNotifications.length} notifications marked as read`);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleViewJob = (jobId: string) => {
    navigate('/jobs');
    // In a more complex implementation, we could navigate to a specific job detail page
  };

  const handleViewApplicant = (studentId: string) => {
    // For now, we'll just show a toast since we don't have a detailed student profile view
    toast.info('This functionality is not yet implemented');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header showBackButton={true} />

        <div className="mt-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              <Bell className="inline-block mr-2 h-5 w-5 text-edu-purple" />
              <T>Notifications</T>
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-edu-purple text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-edu-card-border text-muted-foreground"
                onClick={handleMarkAllAsRead}
              >
                <Check className="mr-1.5 h-4 w-4" />
                <T>Mark All Read</T>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 text-edu-purple animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-edu-card-bg rounded-lg">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2"><T>No notifications yet</T></h3>
              <p className="text-muted-foreground">
                <T>You'll be notified when students apply to your job postings</T>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <EmployerNotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onViewJob={handleViewJob}
                  onViewApplicant={handleViewApplicant}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default EmployerNotifications;
