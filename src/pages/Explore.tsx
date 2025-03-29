import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Users, Edit, BookMarked, Play } from 'lucide-react';
import { toast } from 'sonner';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import TranslatedText from '@/components/TranslatedText';

const Explore = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [creatorUsernames, setCreatorUsernames] = useState<Record<string, string>>({});
  const [courseImages, setCourseImages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllCourses();

    // Set up real-time subscription for new courses
    const coursesChannel = supabase
      .channel('public:courses')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'courses',
        }, 
        async (payload) => {
          console.log('Course changes detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the newly added course
            const { data: newCourse, error } = await supabase
              .from('courses')
              .select('*')
              .eq('id', payload.new.id)
              .single();
              
            if (!error && newCourse) {
              // Fetch creator username
              const { data: creatorData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', newCourse.created_by)
                .single();
                
              const creatorUsername = creatorData?.username || 'Unknown Teacher';
              
              let userEnrollments: string[] = [];
              if (user) {
                // Check if user is enrolled in this new course
                const { data } = await supabase
                  .from('user_courses')
                  .select('course_id')
                  .eq('user_id', user.id)
                  .eq('course_id', newCourse.id);
                
                userEnrollments = data?.map(e => e.course_id) || [];
              }
              
              // Fetch course image
              const imageUrl = await fetchCourseImage(newCourse.title);
              
              const processedCourse = {
                ...newCourse,
                isEnrolled: userEnrollments.includes(newCourse.id),
                creatorUsername,
                imageUrl
              };
              
              setCourses(prevCourses => {
                // Check if already exists to avoid duplicates
                if (!prevCourses.some(course => course.id === newCourse.id)) {
                  return [processedCourse, ...prevCourses];
                }
                return prevCourses;
              });
              
              toast.info("New course available", {
                description: `"${newCourse.title}" has been published`
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update the modified course
            setCourses(prevCourses => 
              prevCourses.map(course => 
                course.id === payload.new.id 
                  ? { ...course, ...payload.new } 
                  : course
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove the deleted course
            setCourses(prevCourses => 
              prevCourses.filter(course => course.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(coursesChannel);
    };
  }, [user]);

  const fetchCourseImage = async (courseTitle: string) => {
    try {
      // Use a hardcoded set of images instead of relying on Google API which is failing
      const courseImages = [
        '/lovable-uploads/4e06f3e0-3c9a-4d1d-9261-bf4ece771acc.png',
        'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'
      ];
      
      // Generate a deterministic but seemingly random index based on the course title
      // This ensures the same course always gets the same image
      const titleSum = courseTitle.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const index = titleSum % courseImages.length;
      
      return courseImages[index];
    } catch (error) {
      console.error("Error with course image:", error);
      // Return default image on error
      return "/lovable-uploads/4e06f3e0-3c9a-4d1d-9261-bf4ece771acc.png";
    }
  };

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching all courses...");
      
      // Get all courses without any filtering
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }
      
      console.log("Courses fetched:", coursesData?.length || 0, coursesData);
      
      // Get user enrollments if logged in
      let userEnrollments: string[] = [];
      if (user) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', user.id);
        
        if (!enrollmentsError && enrollmentsData) {
          userEnrollments = enrollmentsData.map(e => e.course_id);
        }
        
        console.log("User enrollments:", userEnrollments);
      }
      
      // Collect all creator IDs
      const creatorIds = [...new Set(coursesData?.map(course => course.created_by) || [])];
      console.log("Creator IDs:", creatorIds);
      
      // Fetch all usernames in one go
      if (creatorIds.length > 0) {
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', creatorIds);
          
        if (creatorsError) {
          console.error('Error fetching creator profiles:', creatorsError);
        }
        
        console.log("Creator profiles:", creatorsData);
        
        const usernameLookup: Record<string, string> = {};
        creatorsData?.forEach(creator => {
          usernameLookup[creator.id] = creator.username || 'Unknown Teacher';
        });
        
        setCreatorUsernames(usernameLookup);
      }
      
      // Fetch images for all courses
      const imagePromises = (coursesData || []).map(async (course) => {
        return { 
          id: course.id, 
          imageUrl: await fetchCourseImage(course.title) 
        };
      });
      
      const courseImageResults = await Promise.all(imagePromises);
      const imageLookup: Record<string, string> = {};
      courseImageResults.forEach(result => {
        imageLookup[result.id] = result.imageUrl;
      });
      
      setCourseImages(imageLookup);
      
      // Process courses with enrollment status and images
      const processedCourses = coursesData?.map(course => ({
        ...course,
        isEnrolled: userEnrollments.includes(course.id),
        imageUrl: imageLookup[course.id]
      })) || [];
      
      console.log("Processed courses:", processedCourses);
      setCourses(processedCourses);
    } catch (error: any) {
      console.error('Error in fetchAllCourses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) {
      toast.error("You must be logged in to enroll in courses");
      return;
    }
    
    try {
      setEnrollingCourseId(courseId);
      
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (existingEnrollment) {
        toast.info("You're already enrolled in this course");
        return;
      }
      
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId
        });
      
      if (error) throw error;
      
      toast.success("Successfully enrolled in course");
      
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true } 
            : course
        )
      );
      
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error("Error enrolling in course");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex justify-between items-center">
          <Header />
          <FullLanguageSwitcher variant="ghost" size="icon" />
        </div>
        
        <div className="my-6">
          <h1 className="text-2xl font-bold mb-2"><TranslatedText text="Explore Courses" /></h1>
          <p className="text-muted-foreground"><TranslatedText text="Discover courses created by our educators" /></p>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search courses..." 
              className="pl-10 bg-edu-card-bg border-edu-card-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400"><TranslatedText text="Loading courses..." /></p>
          </div>
        ) : (
          <>
            {filteredCourses.length === 0 ? (
              <div className="text-center py-8 bg-edu-card-bg rounded-lg">
                <p><TranslatedText text="No courses found matching your search." /></p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="bg-edu-card-bg border-edu-card-border overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.imageUrl || "/lovable-uploads/4e06f3e0-3c9a-4d1d-9261-bf4ece771acc.png"} 
                        alt="Course preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback image if the fetched image fails to load
                          (e.target as HTMLImageElement).src = "/lovable-uploads/4e06f3e0-3c9a-4d1d-9261-bf4ece771acc.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Link to={`/courses/${course.id}`} className="bg-edu-purple rounded-full p-3">
                          <Play size={24} className="text-white" />
                        </Link>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        <Link to={`/courses/${course.id}`} className="text-edu-purple hover:text-edu-purple-light">
                          {course.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <BookOpen size={14} />
                          <span>Course</span>
                          
                          {course.created_by && (
                            <div className="flex items-center">
                              <Users size={14} />
                              <span>
                                By {creatorUsernames[course.created_by] || 'Unknown Teacher'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center">
                          {user?.user_metadata?.role === 'teacher' && course.created_by === user.id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-edu-purple border-edu-purple"
                              asChild
                            >
                              <Link to={`/courses/${course.id}/edit-learn`}>
                                <Edit size={14} className="mr-1" />
                                Edit Course
                              </Link>
                            </Button>
                          ) : course.isEnrolled ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-edu-purple border-edu-purple"
                              asChild
                            >
                              <Link to={`/courses/${course.id}/learn`}>
                                Continue Learning
                              </Link>
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-edu-purple border-edu-purple"
                                asChild
                              >
                                <Link to={`/courses/${course.id}`}>
                                  <BookMarked size={14} className="mr-1" />
                                  Preview
                                </Link>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-edu-purple hover:bg-edu-purple-light"
                                onClick={() => handleEnrollCourse(course.id)}
                                disabled={enrollingCourseId === course.id}
                              >
                                {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Explore;
