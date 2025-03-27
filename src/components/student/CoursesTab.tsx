
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookMarked, Award, Video, Edit, Plus, Users, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the schema for adding a video
const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  section: z.string().min(1, "Section is required"),
  videoUrl: z.string().url("Please enter a valid URL"),
});

// Define the schema for creating a new course
const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
});

type VideoFormValues = z.infer<typeof videoSchema>;
type CourseFormValues = z.infer<typeof courseSchema>;

const CoursesTab: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentCourses, setCurrentCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [createdCourses, setCreatedCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEducator, setIsEducator] = useState(false);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});

  const videoForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      section: "overview", // Default section
      videoUrl: "",
    },
  });

  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (user) {
      const isTeacher = user?.user_metadata?.role === 'teacher';
      setIsEducator(isTeacher);
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if user is an educator
      const isTeacher = user?.user_metadata?.role === 'teacher';
      
      // If user is an educator, fetch courses they created
      if (isTeacher) {
        const { data: createdCoursesData, error: createdCoursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        
        if (createdCoursesError) throw createdCoursesError;
        
        // Fetch enrollment counts for each course
        const coursesWithEnrollments = await Promise.all(
          (createdCoursesData || []).map(async (course) => {
            const { count, error } = await supabase
              .from('user_courses')
              .select('*', { count: 'exact', head: true })
              .eq('course_id', course.id);
            
            return {
              ...course,
              enrollmentCount: error ? 0 : count || 0
            };
          })
        );
        
        setCreatedCourses(coursesWithEnrollments || []);
        
        // Create an object with course_id: enrollmentCount for easy access
        const enrollmentCounts: Record<string, number> = {};
        coursesWithEnrollments.forEach(course => {
          enrollmentCounts[course.id] = course.enrollmentCount;
        });
        setEnrollments(enrollmentCounts);
      }
      
      // For student view
      if (!isTeacher) {
        // Fetch all courses for student view
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (coursesError) throw coursesError;

        // Fetch user's enrolled courses
        const { data: enrolledData, error: enrolledError } = await supabase
          .from('user_courses')
          .select(`
            enrolled_at,
            courses:course_id (
              id,
              title,
              description
            )
          `)
          .eq('user_id', user.id);
        
        if (enrolledError) throw enrolledError;
        
        // Transform enrolled courses data
        const enrolledCourseIds = enrolledData.map(item => item.courses.id);
        const enrolledCoursesTransformed = enrolledData.map(item => ({
          ...item.courses,
          progress: Math.floor(Math.random() * 100),
          deadline: `${Math.floor(Math.random() * 10) + 1} days`
        }));
        
        // For completed courses, filter enrolled courses with 100% progress
        const completedCoursesData = enrolledCoursesTransformed
          .filter(course => course.progress === 100)
          .map(course => ({
            ...course,
            completedDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
          }));
        
        // For current courses, filter enrolled courses with less than 100% progress
        const currentCoursesData = enrolledCoursesTransformed.filter(course => course.progress < 100);
        
        // For recommended courses, get courses that the user isn't enrolled in
        const recommendedCoursesData = coursesData
          .filter(course => !enrolledCourseIds.includes(course.id))
          .slice(0, 3)
          .map(course => ({
            ...course,
            match: `${Math.floor(80 + Math.random() * 20)}%`
          }));
        
        // For available courses, get all courses that the user isn't enrolled in
        const availableCoursesData = coursesData
          .filter(course => !enrolledCourseIds.includes(course.id))
          .map(course => ({
            ...course
          }));
        
        setCurrentCourses(currentCoursesData);
        setCompletedCourses(completedCoursesData);
        setRecommendedCourses(recommendedCoursesData);
        setAvailableCourses(availableCoursesData);
      }
      
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast.error("Error fetching courses", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkCourse = (id: string) => {
    toast("Course Bookmarked", {
      description: "This course has been added to your bookmarks."
    });
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) {
      toast.error("You must be logged in to enroll");
      return;
    }
    
    try {
      setEnrollingCourseId(courseId);
      
      const { data, error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId
        });
      
      if (error) throw error;
      
      toast.success("Successfully enrolled in course");
      
      // Refresh the courses lists
      fetchCourses();
      
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error("Error enrolling in course", { 
        description: error.message 
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleAddVideo = (course: any) => {
    setSelectedCourse(course);
    setShowAddVideoDialog(true);
    videoForm.reset(); // Reset form when opening dialog
  };

  const handleAddCourse = () => {
    setShowAddCourseDialog(true);
    courseForm.reset(); // Reset form when opening dialog
  };

  const onSubmitVideo = async (values: VideoFormValues) => {
    if (!selectedCourse) return;
    
    try {
      // In a real implementation, you'd upload the video to storage
      // Here we're just adding a record in course_materials
      const { data, error } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: selectedCourse.id,
            file_name: values.title,
            file_type: 'video',
            file_path: values.videoUrl, // We're just storing the URL
            file_size: 0, // Size is unknown since we're just storing a URL
            created_by: user?.id
          }
        ]);
      
      if (error) throw error;
      
      toast.success("Video added to course", {
        description: `Video was successfully added to ${selectedCourse.title}`
      });
      
      setShowAddVideoDialog(false);
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast.error("Error adding video", {
        description: error.message
      });
    }
  };

  const onSubmitCourse = async (values: CourseFormValues) => {
    if (!user) return;
    
    try {
      // Insert new course
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: values.title,
            description: values.description,
            created_by: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Course created", {
        description: "Your course has been successfully created and published."
      });
      
      // Close dialog and refresh course list
      setShowAddCourseDialog(false);
      fetchCourses();
      
      // Navigate to the new course details page
      if (data && data.length > 0) {
        navigate(`/courses/${data[0].id}`);
      }
      
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error("Error creating course", {
        description: error.message
      });
    }
  };

  // Filter courses based on search query
  const filteredCurrentCourses = currentCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCreatedCourses = createdCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAvailableCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="bg-edu-card-bg border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isEducator ? "My Courses" : "My Courses"}</CardTitle>
            <CardDescription className="text-gray-400">
              {isEducator ? "Manage your created courses and student progress" : "Track your learning progress"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search courses..." 
              className="w-40 md:w-60 bg-edu-dark/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button size="sm" variant="outline" className="rounded-full">
              <Search size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : (
            <>
              {isEducator && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Courses You Created</h3>
                    <Button 
                      onClick={handleAddCourse}
                      size="sm" 
                      className="flex items-center gap-1 bg-edu-purple"
                    >
                      <PlusCircle size={14} />
                      New Course
                    </Button>
                  </div>
                  
                  {filteredCreatedCourses.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCreatedCourses.map(course => (
                        <div key={course.id} className="p-4 bg-edu-dark/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link to={`/courses/${course.id}`}>
                                <h3 className="font-medium">{course.title}</h3>
                              </Link>
                              <p className="text-xs text-gray-400">{course.description}</p>
                              <div className="flex items-center mt-2 text-xs text-edu-purple">
                                <Users size={14} className="mr-1" />
                                <span>{enrollments[course.id] || 0} student{enrollments[course.id] !== 1 ? 's' : ''} enrolled</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleAddVideo(course)}
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1"
                              >
                                <Plus size={14} />
                                <Video size={14} />
                              </Button>
                              <Link to={`/courses/${course.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit size={14} />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-edu-dark/30 rounded-lg">
                      {searchQuery ? 
                        "No courses found matching your search." : 
                        "You haven't created any courses yet. Click 'New Course' to get started."}
                    </div>
                  )}
                </div>
              )}
              
              {!isEducator && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Current Courses</h3>
                  {filteredCurrentCourses.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCurrentCourses.map(course => (
                        <Link to={`/courses/${course.id}`} key={course.id}>
                          <div className="p-4 bg-edu-dark/30 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{course.title}</h3>
                                <p className="text-xs text-gray-400">Deadline in {course.deadline}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{course.progress}%</span>
                                <Button 
                                  onClick={(e) => { 
                                    e.preventDefault(); 
                                    handleBookmarkCourse(course.id); 
                                  }}
                                  variant="ghost" 
                                  size="sm" 
                                  className="p-1 h-auto ml-2"
                                >
                                  <BookMarked size={16} />
                                </Button>
                              </div>
                            </div>
                            <Progress value={course.progress} className="h-2 mt-2" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-edu-dark/30 rounded-lg">
                      {searchQuery ? "No courses found matching your search." : "You're not enrolled in any courses yet."}
                    </div>
                  )}
                </div>
              )}
              
              {!isEducator && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Available Courses</h3>
                  {filteredAvailableCourses.length > 0 ? (
                    <div className="space-y-3">
                      {filteredAvailableCourses.map(course => (
                        <div key={course.id} className="p-4 bg-edu-dark/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link to={`/courses/${course.id}`}>
                                <h3 className="font-medium">{course.title}</h3>
                              </Link>
                              <p className="text-xs text-gray-400">{course.description || "No description available"}</p>
                            </div>
                            <Button 
                              onClick={() => handleEnrollCourse(course.id)}
                              size="sm" 
                              className="bg-edu-purple"
                              disabled={enrollingCourseId === course.id}
                            >
                              {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-edu-dark/30 rounded-lg">
                      {searchQuery ? 
                        "No available courses found matching your search." : 
                        "No available courses to enroll in at the moment."}
                    </div>
                  )}
                </div>
              )}
              
              {!isEducator && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Completed Courses</h3>
                  {completedCourses.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {completedCourses.map(course => (
                        <Link to={`/courses/${course.id}`} key={course.id}>
                          <div className="p-4 bg-edu-dark/30 rounded-lg flex flex-col items-center">
                            <Award size={24} className="text-edu-purple mb-2" />
                            <h3 className="font-medium text-center text-sm">{course.title}</h3>
                            <p className="text-xs text-gray-400 mt-1">Completed on {course.completedDate}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-edu-dark/30 rounded-lg">
                      You haven't completed any courses yet.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Recommended Courses - only show for students */}
      {!isEducator && (
        <Card className="bg-edu-card-bg border-none">
          <CardHeader>
            <CardTitle>Recommended For You</CardTitle>
            <CardDescription className="text-gray-400">Based on your interests and learning history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading recommendations...</div>
            ) : recommendedCourses.length > 0 ? (
              <div className="space-y-3">
                {recommendedCourses.map(course => (
                  <Link to={`/courses/${course.id}`} key={course.id}>
                    <div className="p-4 bg-edu-dark/30 rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-xs text-gray-400">Based on your interests</p>
                      </div>
                      <div className="bg-edu-purple/20 px-2 py-1 rounded-full text-xs text-edu-purple">
                        {course.match} match
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-edu-dark/30 rounded-lg">
                No recommendations available yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Add Video Dialog */}
      <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>Add Video to {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Add a video to a specific section of your course.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...videoForm}>
            <form onSubmit={videoForm.handleSubmit(onSubmitVideo)} className="space-y-4">
              <FormField
                control={videoForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to the course" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={videoForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the video content" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={videoForm.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full rounded-md bg-edu-dark/50 px-3 py-2 text-white"
                        {...field}
                      >
                        <option value="overview">Course Overview</option>
                        <option value="structure">Course Structure</option>
                        <option value="content">Course Content</option>
                        <option value="supplementary">Supplementary Material</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={videoForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/video.mp4 or YouTube URL" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddVideoDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-edu-purple hover:bg-edu-purple-light">
                  Add Video
                </Button>
              </DialogFooter>
            </form>
          </Form>
          
        </DialogContent>
      </Dialog>
      
      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create and publish a new course.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to Programming" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A comprehensive introduction to programming concepts..." 
                        {...field} 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddCourseDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-edu-purple hover:bg-edu-purple-light">
                  Create & Publish
                </Button>
              </DialogFooter>
            </form>
          </Form>
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesTab;
