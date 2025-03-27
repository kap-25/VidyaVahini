import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import CoursesTab from '@/components/student/CoursesTab';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CourseEditLinks from '@/components/educator/CourseEditLinks';
import VoiceAssistant from '@/components/VoiceAssistant';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = user?.user_metadata?.role === 'teacher';

  useEffect(() => {
    if (user && !isTeacher) {
      toast.error("Only educators can access this page");
    }

    if (user && isTeacher) {
      fetchEducatorCourses();
    }
  }, [user, isTeacher]);

  const fetchEducatorCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error.message);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-educators to the student dashboard
  if (user && !isTeacher) {
    return <Navigate to="/student-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />
        
        <div className="my-6">
          <h1 className="text-2xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">Manage your created courses and add materials</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading your courses...</p>
          </div>
        ) : (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-8 bg-edu-card-bg rounded-lg">
                <p className="mb-4">You haven't created any courses yet.</p>
                <Button asChild className="bg-edu-purple">
                  <Link to="/courses/create">
                    <Plus size={16} className="mr-2" />
                    Create Your First Course
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-edu-card-bg p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {course.description?.substring(0, 100)}
                      {course.description?.length > 100 ? '...' : ''}
                    </p>
                    <CourseEditLinks courseId={course.id} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <BottomNavigation />
      <VoiceAssistant />
    </div>
  );
};

export default MyCourses;
