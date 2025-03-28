
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Loader2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import { T } from '@/components/T';

const StudentProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Fetch enrolled courses
        const { data: userCourses, error: coursesError } = await supabase
          .from('user_courses')
          .select('*, courses(*)')
          .eq('user_id', user.id);
        
        if (coursesError) throw coursesError;
        
        setEnrolledCourses(userCourses || []);
        
        // Just for demo - set a random number of completed courses
        setCompletedCourses(Math.min(userCourses?.length || 0, Math.floor(Math.random() * 3)));
        
      } catch (error: any) {
        console.error('Error fetching student data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);
  
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
