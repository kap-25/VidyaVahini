import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Loader2, Edit, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import { T } from '@/components/T';
import { toast } from 'sonner';

export const reminderMessages = [
  {
    title: "Time to Level Up! 🎮",
    body: "Your brain is like a muscle - it needs daily training! Let's make it stronger! 💪"
  },
  {
    title: "Knowledge is Power! ⚡",
    body: "Every minute you study is a step closer to your goals. You've got this! 🚀"
  },
  {
    title: "Study Time! 📚",
    body: "Your future self will thank you for studying now. Let's make it happen! 🌟"
  },
  {
    title: "Brain Exercise Time! 🧠",
    body: "Just like your body, your mind needs regular exercise. Time to flex those mental muscles! 💪"
  },
  {
    title: "Learning Adventure Awaits! 🗺️",
    body: "Every study session is a new adventure in knowledge. Ready to explore? 🚀"
  },
  {
    title: "Time to Shine! ✨",
    body: "Your potential is limitless. Let's unlock it one study session at a time! 🌟"
  },
  {
    title: "Study Mode: Activated! 🎯",
    body: "Success is built one study session at a time. Let's make today count! 💫"
  },
  {
    title: "Knowledge Check! 📖",
    body: "Your brain is hungry for knowledge. Time to feed it! 🧠"
  }
];

const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * reminderMessages.length);
  return reminderMessages[randomIndex];
};

const StudentProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [reminderTime, setReminderTime] = useState(localStorage.getItem('reminderTime') || '');
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [notificationScheduled, setNotificationScheduled] = useState(false);

  // Pre-load audio and handle errors
  const [notificationSound] = useState(() => {
    const audio = new Audio('/audio.mp3');
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    // Handle loading errors
    audio.onerror = () => {
      console.error('Error loading notification sound');
      toast.error('Failed to load notification sound');
    };
    
    return audio;
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const { data: userCourses, error: coursesError } = await supabase
          .from('user_courses')
          .select('*, courses(*)')
          .eq('user_id', user.id);
        
        if (coursesError) throw coursesError;
        setEnrolledCourses(userCourses || []);
        
        // Calculate completed courses based on progress (you should implement proper logic)
        setCompletedCourses(Math.min(userCourses?.length || 0, Math.floor(Math.random() * 3)));
      } catch (error: any) {
        console.error('Error fetching student data:', error.message);
        toast.error('Failed to fetch your courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
    
    // Check if notifications are already enabled
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    try {
      // First check if the browser supports notifications
      if (!('Notification' in window)) {
        toast.error('Your browser does not support notifications');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll receive study reminders.');
        // Send a test notification
        new Notification('Notifications Enabled!', {
          body: 'You will now receive study reminders at your scheduled time.',
          icon: '/favicon.ico'
        });
      } else if (permission === 'denied') {
        toast.error('Please enable notifications in your browser settings to receive reminders');
      } else {
        toast.info('Please allow notifications when prompted');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  useEffect(() => {
    if (!reminderTime || notificationPermission !== 'granted') {
      setNotificationScheduled(false);
      return;
    }

    const checkReminder = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      if (currentTime === reminderTime && !notificationScheduled) {
        setNotificationScheduled(true);
        const message = getRandomMessage();
        
        // Play audio and show notification with retry mechanism
        const playNotification = async (retries = 3) => {
          try {
            // Reset audio to start
            notificationSound.currentTime = 0;
            
            // Play with retry mechanism
            const playPromise = notificationSound.play();
            if (playPromise !== undefined) {
              await playPromise;
              
              // Vibrate if supported
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }

              // Show notification
              new Notification(message.title, {
                body: message.body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'study-reminder',
                silent: false,
              });
            }
          } catch (error) {
            console.error('Notification sound error:', error);
            if (retries > 0) {
              setTimeout(() => playNotification(retries - 1), 1000);
            } else {
              toast.error('Failed to play notification sound');
            }
          }
        };

        playNotification();

        // Reset the scheduled flag after 1 minute
        setTimeout(() => setNotificationScheduled(false), 60000);
      }
    }, 1000);

    return () => clearInterval(checkReminder);
  }, [reminderTime, notificationPermission, notificationScheduled, notificationSound]);

  const handleReminderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setReminderTime(time);
    setNotificationScheduled(false);
    localStorage.setItem('reminderTime', time);

    if (time) {
      toast.success(`Study reminder set for ${time} every day! 📚`);
    } else {
      toast.info('Study reminder disabled');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
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
        
        <div className="bg-edu-card-bg rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold"><T>Student Profile</T></h1>
            <div className="flex gap-2">
              <FullLanguageSwitcher variant="ghost" size="sm" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => console.info('Edit profile feature coming soon')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-edu-purple flex items-center justify-center text-xl font-bold mr-4">
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'Student'}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-edu-purple/20 p-4 rounded-lg">
              <p className="text-sm text-edu-purple-light mb-1"><T>Enrolled Courses</T></p>
              <p className="text-2xl font-bold">{enrolledCourses.length}</p>
            </Card>
            <Card className="bg-green-500/20 p-4 rounded-lg">
              <p className="text-sm text-green-400 mb-1"><T>Completed</T></p>
              <p className="text-2xl font-bold">{completedCourses}</p>
            </Card>
          </div>

          <div className="mb-6 bg-edu-dark/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center">
                <Bell className="mr-2 text-white h-5 w-5" /> <T>Daily Study Reminder</T>
              </label>
              {notificationPermission !== 'granted' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="text-xs bg-edu-purple hover:bg-edu-purple/80"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <T>Enable Notifications</T>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                notificationPermission === 'granted' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-gray-400">
                {notificationPermission === 'granted' ? 
                  <T>Notifications are enabled</T> : 
                  <T>Notifications are disabled</T>
                }
              </span>
            </div>
            <input
              type="time"
              value={reminderTime}
              onChange={handleReminderChange}
              className="w-full p-2 bg-edu-dark border border-gray-600 rounded mt-2"
              disabled={notificationPermission !== 'granted'}
            />
            <p className="text-xs text-gray-400 mt-2">
              {reminderTime && notificationPermission === 'granted'
                ? <T>{`You'll receive a study reminder at ${reminderTime} every day`}</T>
                : <T>Set a time to receive daily study reminders</T>}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3"><T>My Courses</T></h3>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="bg-edu-dark/30 p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{enrollment.courses.title}</p>
                        <p className="text-xs text-gray-400">
                          <T>Enrolled</T>: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/courses/${enrollment.course_id}/learn`)}
                      >
                        <T>Continue</T>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-edu-dark/20 rounded-lg">
                <p className="text-gray-400"><T>You haven't enrolled in any courses yet</T></p>
                <Button 
                  onClick={() => navigate('/courses')} 
                  variant="link" 
                  className="text-edu-purple mt-2"
                >
                  <T>Browse Courses</T>
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-muted"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <T>Sign Out</T>
          </Button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default StudentProfile;
