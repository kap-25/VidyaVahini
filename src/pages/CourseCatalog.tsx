
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Star, Award, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseCard from '@/components/CourseCard';
import RecommendedCourseCard from '@/components/RecommendedCourseCard';

// Mock data for course categories
const courseCategories = [
  { id: 1, name: 'STEM', icon: '🔬', color: 'bg-blue-500' },
  { id: 2, name: 'Humanities', icon: '📚', color: 'bg-yellow-500' },
  { id: 3, name: 'Languages', icon: '🗣️', color: 'bg-green-500' },
  { id: 4, name: 'Business', icon: '💼', color: 'bg-purple-500' },
  { id: 5, name: 'Arts', icon: '🎨', color: 'bg-pink-500' },
  { id: 6, name: 'Health', icon: '⚕️', color: 'bg-red-500' },
];

// Mock data for courses in progress
const inProgressCourses = [
  { id: 1, title: 'Advanced Mathematics', progress: 75, timeLeft: '2h 15m' },
  { id: 2, title: 'Physics Fundamentals', progress: 45, timeLeft: '4h 30m' },
  { id: 3, title: 'Web Development Basics', progress: 60, timeLeft: '3h 10m' },
];

// Mock data for completed courses
const completedCourses = [
  { id: 4, title: 'Introduction to Biology', progress: 100, timeLeft: '0h 0m' },
  { id: 5, title: 'Creative Writing', progress: 100, timeLeft: '0h 0m' },
];

// Mock data for recommended courses
const recommendedCourses = [
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
  { 
    id: 3, 
    title: 'History of Art', 
    description: 'From Renaissance to Modern', 
    duration: '5h 15m',
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 4, 
    title: 'Business Ethics', 
    description: 'Case studies and principles', 
    duration: '4h 00m',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
  },
];

const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            type="text"
            placeholder="Search courses..." 
            className="w-full bg-edu-card-bg border-none pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Course Categories */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <Link to="/courses/categories" className="text-edu-purple text-sm flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {courseCategories.map(category => (
              <Link 
                to={`/courses/category/${category.id}`} 
                key={category.id}
                className={`${category.color} rounded-xl p-4 flex flex-col items-center justify-center aspect-square`}
              >
                <span className="text-2xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
        
        {/* My Courses */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Courses</h2>
            <Link to="/my-courses" className="text-edu-purple text-sm flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <Tabs defaultValue="inProgress" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-edu-card-bg mb-4">
              <TabsTrigger value="inProgress" className="text-xs">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
              <TabsTrigger value="enrolled" className="text-xs">Enrolled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inProgress">
              {inProgressCourses.map(course => (
                <Link to={`/courses/${course.id}`} key={course.id}>
                  <CourseCard 
                    title={course.title}
                    progress={course.progress}
                    timeLeft={course.timeLeft}
                    className="mb-3"
                  />
                </Link>
              ))}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedCourses.map(course => (
                <Link to={`/courses/${course.id}`} key={course.id}>
                  <CourseCard 
                    title={course.title}
                    progress={course.progress}
                    timeLeft={course.timeLeft}
                    className="mb-3"
                  />
                </Link>
              ))}
            </TabsContent>
            
            <TabsContent value="enrolled">
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen size={40} className="mb-2" />
                <p>No enrolled courses yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* Recommended Courses */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recommended</h2>
            <Link to="/courses/recommended" className="text-edu-purple text-sm flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recommendedCourses.map(course => (
              <Link to={`/courses/${course.id}`} key={course.id}>
                <RecommendedCourseCard 
                  title={course.title}
                  description={course.description}
                  duration={course.duration}
                  imageUrl={course.imageUrl}
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CourseCatalog;
