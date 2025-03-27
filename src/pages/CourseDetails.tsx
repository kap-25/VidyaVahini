import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Clock, User, BookOpen, MessageCircle, Download, Share2, File, FileText, Film, Play, CheckCircle, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CourseDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({
    0: true
  });
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id || !user) return;
      try {
        setLoading(true);
        const {
          data: courseData,
          error: courseError
        } = await supabase.from('courses').select('*').eq('id', id).single();
        if (courseError) throw courseError;
        
        if (courseData) {
          setCourse(courseData);
          
          if (user && courseData.created_by === user.id) {
            setIsCreator(true);
          }
          
          const {
            data: enrollmentData,
            error: enrollmentError
          } = await supabase.from('user_courses').select('*').eq('user_id', user.id).eq('course_id', id);
          if (enrollmentError) throw enrollmentError;
          setIsEnrolled(enrollmentData && enrollmentData.length > 0);
          if (enrollmentData && enrollmentData.length > 0 || courseData.created_by === user.id) {
            const {
              data: materialsData,
              error: materialsError
            } = await supabase.from('course_materials').select('*').eq('course_id', id);
            if (materialsError) throw materialsError;
            setCourseMaterials(materialsData || []);
          }
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error.message);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id, user]);

  const toggleModule = (index: number) => {
    setOpenModules(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnroll = async () => {
    if (!user || !id) {
      toast.error('You must be logged in to enroll in a course');
      navigate('/auth');
      return;
    }
    try {
      setEnrollmentLoading(true);
      if (isEnrolled) {
        const {
          error
        } = await supabase.from('user_courses').delete().eq('user_id', user.id).eq('course_id', id);
        if (error) throw error;
        toast.success('Successfully unenrolled from course');
        setIsEnrolled(false);
        setCourseMaterials([]);
      } else {
        const {
          error
        } = await supabase.from('user_courses').insert({
          user_id: user.id,
          course_id: id
        });
        if (error) throw error;
        toast.success('Successfully enrolled in course');
        setIsEnrolled(true);
        const {
          data: materialsData,
          error: materialsError
        } = await supabase.from('course_materials').select('*').eq('course_id', id);
        if (materialsError) throw materialsError;
        setCourseMaterials(materialsData || []);
      }
    } catch (error: any) {
      console.error('Error with course enrollment:', error.message);
      toast.error(error.message || 'Failed to process enrollment');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Film className="text-blue-400" />;
      case 'pdf':
        return <FileText className="text-red-400" />;
      default:
        return <File className="text-gray-400" />;
    }
  };

  const openMaterialViewer = (material: any) => {
    setSelectedMaterial(material);
    setViewerOpen(true);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const {
        data,
        error
      } = await supabase.storage.from('course_materials').download(filePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloading ${fileName}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const modules = [{
    title: 'Introduction',
    lectures: 2,
    duration: '6min',
    lessons: [{
      title: 'Introduction',
      duration: '04:12',
      preview: true
    }, {
      title: 'IMPORTANT - Setting up environment',
      duration: '00:26',
      preview: false
    }]
  }, {
    title: 'Getting Started with Course Fundamentals',
    lectures: 4,
    duration: '15min',
    lessons: [{
      title: 'Setting up your development environment',
      duration: '03:45',
      preview: false
    }, {
      title: 'Understanding key concepts',
      duration: '04:20',
      preview: false
    }, {
      title: 'Working with the framework',
      duration: '05:15',
      preview: false
    }, {
      title: 'Implementing best practices',
      duration: '02:30',
      preview: false
    }]
  }, {
    title: 'Core Concepts and Techniques',
    lectures: 5,
    duration: '22min',
    lessons: [{
      title: 'Building your first component',
      duration: '06:12',
      preview: false
    }, {
      title: 'Working with data structures',
      duration: '04:45',
      preview: false
    }, {
      title: 'Implementing authentication',
      duration: '05:33',
      preview: false
    }, {
      title: 'Advanced patterns',
      duration: '04:15',
      preview: false
    }, {
      title: 'Testing your application',
      duration: '03:19',
      preview: false
    }]
  }];

  const learningObjectives = ['Build complete data-driven applications from scratch', 'Learn core techniques and best practices', 'Implement authentication and authorization securely', 'Build responsive and accessible user interfaces', 'Work with databases using modern patterns', 'Understand dependency injection and unit testing', 'Deploy applications to production environments', 'Optimize performance and handle errors'];

  if (loading) {
    return <div className="min-h-screen bg-edu-dark text-white flex items-center justify-center">
        <div className="animate-pulse text-edu-purple">Loading course details...</div>
      </div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-edu-dark text-white flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Course not found</p>
        <Button onClick={() => navigate('/courses')}>
          Return to Course Catalog
        </Button>
      </div>;
  }

  return <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex text-sm text-gray-400 mb-4 items-center">
          <Link to="/courses" className="hover:text-white">Courses</Link>
          <ChevronLeft size={16} className="mx-1 transform rotate-180" />
          <span className="text-white">{course.title}</span>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title || "Complete Course Development"}</h1>
          <p className="text-gray-300 mb-4">{course.description || "Learn by building and publishing a practical application from start to finish."}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center">
              <Star className="text-yellow-400 h-5 w-5 mr-1" />
              <span className="font-medium">4.8</span>
              <span className="text-gray-400 text-sm ml-1">(245 ratings)</span>
            </div>
            <div className="flex items-center">
              <User className="text-gray-400 h-5 w-5 mr-1" />
              <span className="text-gray-400 text-sm">1,240 students</span>
            </div>
            <div className="flex items-center">
              <Calendar className="text-gray-400 h-5 w-5 mr-1" />
              <span className="text-gray-400 text-sm">Last updated 2/2024</span>
            </div>
          </div>
        </div>
        
        <div className="relative rounded-xl overflow-hidden mb-6 bg-edu-card-bg">
          <div className="aspect-video relative flex items-center justify-center">
            <img src="/lovable-uploads/4e06f3e0-3c9a-4d1d-9261-bf4ece771acc.png" alt={course.title} className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-edu-purple rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                <Play size={30} className="text-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded text-sm">
              Preview this course
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-edu-card-bg mb-4">
                <TabsTrigger value="content">Course Content</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content">
                <section className="mb-6 bg-edu-card-bg p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">What you'll learn</h2>
                    {isEnrolled && (
                      <Link to={`/courses/${id}/learn`}>
                        <Button className="bg-edu-purple hover:bg-edu-purple/90">
                          Go to course
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learningObjectives.map((objective, index) => <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-edu-purple mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{objective}</span>
                      </div>)}
                  </div>
                </section>
                
                <section className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Course content</h2>
                    <button className="text-edu-purple text-sm hover:underline">
                      Expand all sections
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-4">
                    <span>{modules.length} sections • </span>
                    <span>{modules.reduce((total, module) => total + module.lectures, 0)} lectures • </span>
                    <span>Total length: {modules.reduce((total, module) => {
                      const [mins] = module.duration.match(/\d+/) || ['0'];
                      return total + parseInt(mins, 10);
                    }, 0)} min</span>
                  </div>
                  
                  <div className="space-y-3">
                    {modules.map((module, moduleIndex) => <Collapsible key={moduleIndex} open={openModules[moduleIndex]} className="bg-edu-card-bg rounded-lg overflow-hidden">
                        <CollapsibleTrigger onClick={() => toggleModule(moduleIndex)} className="flex justify-between items-center w-full p-4">
                          <div className="flex-1 text-left flex items-center">
                            <div className={`transform transition-transform ${openModules[moduleIndex] ? 'rotate-90' : ''}`}>
                              <ChevronLeft className="h-5 w-5 transform -rotate-90" />
                            </div>
                            <div className="ml-2">
                              <span className="font-medium">{module.title}</span>
                              <div className="text-xs text-gray-400">
                                {module.lectures} lectures • {module.duration}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-1 border-t border-gray-700">
                            {module.lessons.map((lesson, lessonIndex) => <div key={lessonIndex} className="flex items-center py-2 px-2 hover:bg-edu-dark/20">
                                <div className="mr-3">
                                  {lesson.preview ? <Play size={16} className="text-edu-purple" /> : <File size={16} className="text-gray-400" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm flex items-center">
                                    {lesson.title}
                                    {lesson.preview && <span className="ml-2 text-xs bg-edu-purple/20 text-edu-purple px-2 py-0.5 rounded">
                                        Preview
                                      </span>}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                              </div>)}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>)}
                  </div>
                </section>
                
                <section className="mb-6 bg-edu-card-bg p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-3">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Basic understanding of programming concepts</li>
                    <li>Familiarity with development environments</li>
                    <li>No prior experience with frameworks required</li>
                  </ul>
                </section>
                
                {isEnrolled && (
                  <div className="mb-6">
                    <Link to={`/courses/${id}/learn`}>
                      <Button className="w-full bg-edu-purple hover:bg-edu-purple/90 py-6">
                        Go to course content
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="description">
                <section className="mb-6 bg-edu-card-bg p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="mb-4">
                      {course.description || "This comprehensive course will take you through all the essential aspects of modern application development. You'll learn how to build robust, scalable applications from scratch using industry best practices."}
                    </p>
                    <p className="mb-4">
                      By the end of this course, you'll have the skills to create your own full-stack applications, implement authentication, work with databases, and deploy your projects to production environments.
                    </p>
                    <h3 className="text-lg font-bold mt-6 mb-3">Who this course is for:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Beginner to intermediate developers looking to enhance their skills</li>
                      <li>Professionals wanting to transition to full-stack development</li>
                      <li>Anyone interested in building complete, production-ready applications</li>
                    </ul>
                  </div>
                </section>
                
                <section className="mb-6 bg-edu-card-bg p-6 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Instructor</h2>
                  <div className="flex items-start">
                    <div className="w-16 h-16 rounded-full bg-edu-purple/30 flex items-center justify-center mr-4">
                      <User size={28} className="text-edu-purple" />
                    </div>
                    <div>
                      <h3 className="font-bold">Course Instructor</h3>
                      <p className="text-sm text-gray-400 mb-2">Professional Developer & Educator</p>
                      <div className="flex items-center text-sm mb-3">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>4.8 Instructor Rating</span>
                        <span className="mx-2">•</span>
                        <span>24 Courses</span>
                        <span className="mx-2">•</span>
                        <span>12,400 Students</span>
                      </div>
                      <p className="text-sm">
                        Experienced educator with a passion for teaching development concepts in an accessible, practical way.
                      </p>
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-edu-card-bg rounded-lg p-6 sticky top-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">Free</span>
                  {!isEnrolled && !isCreator && <button onClick={() => setIsFavorite(!isFavorite)} className="p-2">
                      <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
                    </button>}
                </div>
              </div>
              
              {isCreator ? <>
                  <Link to={`/courses/${id}/edit-content`} className="w-full block mb-3">
                    <Button className="w-full bg-edu-purple">
                      Edit Course Content
                    </Button>
                  </Link>
                  <Link to={`/courses/${id}/edit`} className="w-full block mb-3">
                    <Button className="w-full" variant="outline">
                      Edit Course Details
                    </Button>
                  </Link>
                </> : isEnrolled ? <>
                  <Link to={`/courses/${id}/learn`} className="w-full block mb-3">
                    <Button className="w-full bg-edu-purple">
                      Go to course
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full mb-4" onClick={handleEnroll} disabled={enrollmentLoading}>
                    {enrollmentLoading ? 'Processing...' : 'Unenroll'}
                  </Button>
                </> : <>
                  <Button className="w-full bg-edu-purple mb-3" onClick={handleEnroll} disabled={enrollmentLoading}>
                    {enrollmentLoading ? 'Processing...' : 'Enroll now'}
                  </Button>
                  <div className="text-center text-sm text-gray-400 mb-4">
                    Full lifetime access
                  </div>
                </>}
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <span>Over 45 minutes of content</span>
                </div>
                <div className="flex items-center">
                  <File className="h-5 w-5 text-gray-400 mr-3" />
                  <span>15 articles and resources</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-5 w-5 text-gray-400 mr-3" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <span>Certificate on completion</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {selectedMaterial?.file_type === 'video' && <div className="aspect-video rounded overflow-hidden bg-black">
                <video controls className="w-full h-full">
                  <source src={selectedMaterial.file_path.startsWith('http') ? selectedMaterial.file_path : `${supabase.storage.from('course_materials').getPublicUrl(selectedMaterial.file_path).data.publicUrl}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>}
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation />
    </div>;
};

export default CourseDetails;
