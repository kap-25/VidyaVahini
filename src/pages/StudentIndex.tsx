import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import Header from '@/components/Header';
import ActionButtons from '@/components/ActionButtons';
import CourseCard from '@/components/CourseCard';
import RecommendedCourseCard from '@/components/RecommendedCourseCard';
import BottomNavigation from '@/components/BottomNavigation';
import DashboardSummary from '@/components/student/DashboardSummary';
import AiChatBox from '@/components/AiChatBox';
import { supabase } from '@/integrations/supabase/client';
import TranslatedText from '@/components/TranslatedText';
import T from '@/components/T';

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  timeLeft: string;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  due: string;
}

interface RecommendedCourse {
  id: number;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
}

const StudentIndex = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const { data: userCourses, error: coursesError } = await supabase
            .from('user_courses')
            .select('*, courses(*)')
            .eq('user_id', user.id)
            .limit(3);
            
          if (coursesError) throw coursesError;
          
          const transformedCourses = userCourses ? userCourses.map(item => ({
            id: item.courses.id,
            title: item.courses.title,
            progress: Math.floor(Math.random() * 100), 
            timeLeft: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 60)}m`
          })) : [];
          
          setEnrolledCourses(transformedCourses);
          
          setAssignments([
            { id: 1, title: 'Math Problem Set', course: 'Mathematics', due: 'Tomorrow' },
            { id: 2, title: 'Physics Lab Report', course: 'Physics', due: 'In 3 days' },
            { id: 3, title: 'Essay Submission', course: 'Literature', due: 'Next week' }
          ]);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [user]);
  
  const defaultCourses = [
    { id: "1", title: 'Advanced Mathematics', progress: 75, timeLeft: '2h 15m' },
    { id: "2", title: 'Physics Fundamentals', progress: 45, timeLeft: '4h 30m' },
  ];

  const recommendedCourses: RecommendedCourse[] = [
    { 
      id: 1, 
      title: 'Introduction to Python', 
      description: 'Learn programming basics', 
      duration: '2h 30m',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 2, 
      title: 'Chemistry Fundamentals', 
      description: 'Virtual lab experiments', 
      duration: '3h 45m',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
    },
  ];

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />

        <div className="bg-gradient-to-r from-edu-purple-dark to-edu-purple rounded-xl p-5 mb-8">
          <h1 className="text-2xl font-bold mb-1">
            <TranslatedText text={`Welcome back, ${user?.email?.split('@')[0] || 'Student'}!`} />
          </h1>
          <p className="text-white/80 mb-1">
            <T>Continue your learning journey</T>
          </p>
          <p className="text-sm font-medium text-white/90">
            <TranslatedText 
              text={enrolledCourses.length > 0 
                ? `${enrolledCourses.length} course${enrolledCourses.length > 1 ? 's' : ''} in progress` 
                : 'No courses in progress'} 
            />
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/student-dashboard">
              <Button className="bg-white text-edu-purple hover:bg-white/90">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <T>Student Dashboard</T>
              </Button>
            </Link>
          </div>
        </div>

        <ActionButtons />

        <div className="mb-8">
          <DashboardSummary 
            recentCourses={enrolledCourses.length > 0 ? enrolledCourses : defaultCourses}
            upcomingAssignments={assignments}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4"><T>Continue Learning</T></h2>
          {(enrolledCourses.length > 0 ? enrolledCourses : defaultCourses).map(course => (
            <CourseCard 
              key={course.id}
              title={course.title}
              progress={course.progress}
              timeLeft={course.timeLeft}
              className="mb-3"
            />
          ))}
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4"><T>Recommended for You</T></h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendedCourses.map(course => (
              <RecommendedCourseCard 
                key={course.id}
                title={course.title}
                description={course.description}
                duration={course.duration}
                imageUrl={course.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
      
      <AiChatBox />
    </div>
  );
};

export default StudentIndex;
