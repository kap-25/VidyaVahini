import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award, CheckCircle, Video, FileText } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState("ongoing");
  const { user } = useAuth();

  // Sample data - this would typically come from an API call
  const ongoingCourses = [
    { id: 1, title: 'Introduction to AI', progress: 65, lastAccessed: '2 days ago', totalLessons: 12, completedLessons: 8 },
    { id: 2, title: 'Advanced JavaScript', progress: 25, lastAccessed: '1 week ago', totalLessons: 15, completedLessons: 4 },
    { id: 3, title: 'UX Design Fundamentals', progress: 40, lastAccessed: '3 days ago', totalLessons: 10, completedLessons: 4 },
  ];

  const completedCourses = [
    { id: 4, title: 'HTML & CSS Basics', completedDate: '2023-05-15', score: 95 },
    { id: 5, title: 'Introduction to Python', completedDate: '2023-04-20', score: 88 },
  ];

  const isTeacher = user?.user_metadata?.role === 'teacher';

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Courses</h1>
          <p className="text-gray-400">{isTeacher ? "Manage your teaching materials" : "Track your learning progress"}</p>
        </div>

        {isTeacher && (
          <div className="mb-8">
            <Button className="bg-edu-purple hover:bg-edu-purple-dark text-white">
              Create New Course
            </Button>
          </div>
        )}

        <Tabs defaultValue="ongoing" className="mb-8">
          <TabsList className="bg-edu-card-bg mb-6">
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-edu-purple">Ongoing</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-edu-purple">Completed</TabsTrigger>
            {isTeacher && <TabsTrigger value="drafts" className="data-[state=active]:bg-edu-purple">Drafts</TabsTrigger>}
          </TabsList>

          <TabsContent value="ongoing">
            <div className="grid gap-4">
              {ongoingCourses.map(course => (
                <Card key={course.id} className="bg-edu-card-bg border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{course.title}</h3>
                          <div className="flex items-center text-gray-400 text-sm mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>Last accessed {course.lastAccessed}</span>
                          </div>
                        </div>
                        <Link to={`/courses/${course.id}/learn`}>
                          <Button variant="outline" size="sm" className="border-edu-purple text-edu-purple hover:bg-edu-purple hover:text-white">
                            {isTeacher ? "Edit" : "Continue"}
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{course.progress}% Complete</span>
                          <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                        </div>
                        <Progress value={course.progress} className="h-2 bg-gray-700" />
                      </div>
                      
                      <div className="flex space-x-4 text-sm">
                        <div className="flex items-center">
                          <Video size={16} className="mr-1 text-edu-purple" />
                          <span>8 Videos</span>
                        </div>
                        <div className="flex items-center">
                          <FileText size={16} className="mr-1 text-edu-purple" />
                          <span>5 Resources</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle size={16} className="mr-1 text-edu-purple" />
                          <span>3 Quizzes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedCourses.map(course => (
                <Card key={course.id} className="bg-edu-card-bg border-none overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{course.title}</h3>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Award size={14} className="mr-1" />
                          <span>Completed on {new Date(course.completedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="bg-edu-purple/20 text-edu-purple rounded-full px-3 py-1 text-sm">
                        {course.score}% Score
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="border-edu-purple text-edu-purple hover:bg-edu-purple hover:text-white">
                        View Certificate
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:bg-gray-700">
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {isTeacher && (
            <TabsContent value="drafts">
              <div className="text-center py-10 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl mb-2">No draft courses</h3>
                <p>Start creating a new course to see it here</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default MyCourses;
