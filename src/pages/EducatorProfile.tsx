import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Loader2, Edit, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import { T } from '@/components/T';

const EducatorProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teachingCourses, setTeachingCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchEducatorData = async () => {
      setLoading(true);
      try {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('created_by', user.id);
        
        if (coursesError) throw coursesError;
        
        setTeachingCourses(courses || []);
        
        setTotalStudents(Math.floor(Math.random() * 50) + 5);
      } catch (error: any) {
        console.error('Error fetching educator data:', error.message);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEducatorData();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
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
        <Header showBackButton/>
        
        <div className="bg-edu-card-bg rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold"><T>Educator Profile</T></h1>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toast.info('Edit profile feature coming soon')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-edu-purple flex items-center justify-center text-xl font-bold mr-4">
              {user?.email?.charAt(0).toUpperCase() || 'E'}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'Educator'}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-edu-purple/20 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-edu-purple-light mr-2" />
                <p className="text-sm text-edu-purple-light"><T>Courses</T></p>
              </div>
              <p className="text-2xl font-bold mt-1">{teachingCourses.length}</p>
            </Card>
            <Card className="bg-blue-500/20 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <p className="text-sm text-blue-400"><T>Students</T></p>
              </div>
              <p className="text-2xl font-bold mt-1">{totalStudents}</p>
            </Card>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3"><T>My Courses</T></h3>
            {teachingCourses.length > 0 ? (
              <div className="space-y-3">
                {teachingCourses.map((course) => (
                  <Card key={course.id} className="bg-edu-dark/30 p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/courses/${course.id}/edit-content`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-edu-dark/20 rounded-lg">
                <p className="text-gray-400">You haven't created any courses yet</p>
                <Button 
                  onClick={() => navigate('/educator-dashboard')} 
                  variant="link" 
                  className="text-edu-purple mt-2"
                >
                  Create Course
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

export default EducatorProfile;
