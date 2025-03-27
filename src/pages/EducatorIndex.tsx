
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import Header from '@/components/Header';
import ActionButtons from '@/components/ActionButtons';
import CourseCard from '@/components/CourseCard';
import RecommendedCourseCard from '@/components/RecommendedCourseCard';
import BottomNavigation from '@/components/BottomNavigation';
import AiChatBox from '@/components/AiChatBox';
import { supabase } from '@/integrations/supabase/client';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import { T } from '@/components/T';

interface TeachingCourse {
  id: string;
  title: string;
  progress: number;
  timeLeft: string;
}

interface EducatorResource {
  id: number;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
}

const EducatorIndex = () => {
  const { user } = useAuth();
  const [educatorCourses, setEducatorCourses] = useState<TeachingCourse[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      const fetchEducatorData = async () => {
        setLoading(true);
        try {
          const { data: teachingCourses, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .limit(3);
            
          if (coursesError) throw coursesError;
          
          const transformedCourses = teachingCourses ? teachingCourses.map(course => ({
            id: course.id,
            title: course.title,
            progress: Math.floor(Math.random() * 100), 
            timeLeft: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 60)}m`
          })) : [];
          
          setEducatorCourses(transformedCourses);
        } catch (error) {
          console.error('Error fetching educator data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchEducatorData();
    }
  }, [user]);
  
  const defaultCourses = [
    { id: "1", title: 'Advanced Teaching Methodology', progress: 75, timeLeft: '2h 15m' },
    { id: "2", title: 'Educational Psychology', progress: 45, timeLeft: '4h 30m' },
  ];

  const recommendedResources: EducatorResource[] = [
    { 
      id: 1, 
      title: 'Effective Assessment Techniques', 
      description: 'Improve your evaluation methods', 
      duration: '1h, 20m',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: 2, 
      title: 'Digital Teaching Tools', 
      description: 'Enhance your online classroom', 
      duration: '45m',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
    },
  ];

  // Get the user's name safely for display
  const userName = user?.email?.split('@')[0] || 'Educator';

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />

        <div className="bg-gradient-to-r from-edu-purple-dark to-edu-purple rounded-xl p-5 mb-8">
          <h1 className="text-2xl font-bold mb-1">
            <T>{`Welcome back, ${userName}!`}</T>
          </h1>
          <p className="text-white/80 mb-1"><T>Manage your teaching</T></p>
          <p className="text-sm font-medium text-white/90">
            <T>
              {educatorCourses.length > 0 
                ? `${educatorCourses.length} course${educatorCourses.length > 1 ? 's' : ''} you're teaching` 
                : 'No courses assigned yet'}
            </T>
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/educator-dashboard">
              <Button className="bg-white text-edu-purple hover:bg-white/90">
                <GraduationCap className="mr-2 h-4 w-4" />
                <T>Educator Dashboard</T>
              </Button>
            </Link>
            <FullLanguageSwitcher variant="outline" />
          </div>
        </div>

        <ActionButtons />

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4"><T>Your Courses</T></h2>
          {(educatorCourses.length > 0 ? educatorCourses : defaultCourses).map(course => (
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
          <h2 className="text-xl font-bold mb-4"><T>Teaching Resources</T></h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendedResources.map(resource => (
              <RecommendedCourseCard 
                key={resource.id}
                title={resource.title}
                description={resource.description}
                duration={resource.duration}
                imageUrl={resource.imageUrl}
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

export default EducatorIndex;
