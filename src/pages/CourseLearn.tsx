
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, CheckCircle, ExternalLink, Download, MessageSquare, ThumbsUp, Share2, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FullLanguageSwitcher from '@/components/FullLanguageSwitcher';
import TranslatedText from '@/components/TranslatedText';

const CourseLearn = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true, // First section is expanded by default
  });
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [isCreator, setIsCreator] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id || !user) return;
      try {
        setLoading(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Check if user is the course creator
        setIsCreator(courseData.created_by === user.id);
        
        // For non-creators, check if enrolled
        if (!isCreator) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('user_courses')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id);
            
          if (enrollmentError) throw enrollmentError;
          
          // If not enrolled, redirect to course details
          if (!enrollmentData || enrollmentData.length === 0) {
            toast.error('You need to enroll in this course first');
            navigate(`/courses/${id}`);
            return;
          }
        }
        
        // Fetch course materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', id);
          
        if (materialsError) throw materialsError;
        setCourseMaterials(materialsData || []);
        
        // Set first lesson as active if available
        if (modules[0]?.lessons[0]) {
          setActiveLesson(modules[0].lessons[0]);
        }
        
        // Fetch user progress (in a real app, this would be from a user_progress table)
        // For now we'll use mock data
        const mockProgress: Record<string, boolean> = {};
        modules.forEach((module, moduleIndex) => {
          if (moduleIndex === 0) {
            module.lessons.forEach((lesson, lessonIndex) => {
              if (lessonIndex === 0) {
                // Mark first lesson as completed for demo
                mockProgress[`${moduleIndex}-${lessonIndex}`] = true;
              }
            });
          }
        });
        setUserProgress(mockProgress);
        
      } catch (error: any) {
        console.error('Error fetching course data:', error.message);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();

    // Set up real-time subscription for course materials updates
    const courseMaterialsChannel = supabase
      .channel('course-materials-changes')
      .on('postgres_changes', 
        { 
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'course_materials',
          filter: `course_id=eq.${id}` 
        }, 
        (payload) => {
          console.log('Course materials changed:', payload);
          
          // Update materials based on the event type
          if (payload.eventType === 'INSERT') {
            setCourseMaterials(prevMaterials => [...prevMaterials, payload.new]);
            toast.success('New course material added');
          } else if (payload.eventType === 'UPDATE') {
            setCourseMaterials(prevMaterials => 
              prevMaterials.map(material => 
                material.id === payload.new.id ? payload.new : material
              )
            );
            toast.success('Course material updated');
          } else if (payload.eventType === 'DELETE') {
            setCourseMaterials(prevMaterials => 
              prevMaterials.filter(material => material.id !== payload.old.id)
            );
            toast.success('Course material removed');
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(courseMaterialsChannel);
    };
  }, [id, user, navigate, isCreator]);
  
  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const selectLesson = (module: any, lesson: any, moduleIndex: number, lessonIndex: number) => {
    setActiveLesson(lesson);
    setActiveSectionIndex(moduleIndex);
    // Ensure the section is expanded
    setExpandedSections(prev => ({
      ...prev,
      [moduleIndex]: true
    }));
    
    // In a real app, you would track that the user viewed this lesson
    // For demo purposes, we'll just mark it as completed
    setUserProgress(prev => ({
      ...prev,
      [`${moduleIndex}-${lessonIndex}`]: true
    }));
  };
  
  const calculateProgress = () => {
    let completed = 0;
    let total = 0;
    
    modules.forEach((module, moduleIndex) => {
      module.lessons.forEach((_, lessonIndex) => {
        total++;
        if (userProgress[`${moduleIndex}-${lessonIndex}`]) {
          completed++;
        }
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Handle editing a section
  const handleEditSection = (module: any, index: number) => {
    setEditingSection({ ...module, index });
    setNewSectionTitle(module.title);
    setShowSectionDialog(true);
  };

  // Handle saving section changes
  const handleSaveSection = () => {
    if (!newSectionTitle.trim()) {
      toast.error('Section title cannot be empty');
      return;
    }

    // For now, we'll just update the UI since this is a mock implementation
    // In a real app, this would save to the database
    const updatedModules = [...modules];
    if (editingSection) {
      updatedModules[editingSection.index].title = newSectionTitle;
      toast.success('Section updated successfully');
    } else {
      // Add new section
      updatedModules.push({
        title: newSectionTitle,
        lectures: 0,
        duration: '0min',
        lessons: []
      });
      toast.success('Section added successfully');
    }

    // Close dialog
    setShowSectionDialog(false);
    setEditingSection(null);
    setNewSectionTitle('');
  };

  // Handle adding a new section
  const handleAddSection = () => {
    setEditingSection(null);
    setNewSectionTitle('');
    setShowSectionDialog(true);
  };

  // Handle editing a lesson
  const handleEditLesson = (module: any, lesson: any, moduleIndex: number, lessonIndex: number) => {
    setEditingLesson({ ...lesson, moduleIndex, lessonIndex });
    setNewLessonTitle(lesson.title);
    setNewLessonDescription(lesson.description || '');
    setNewLessonVideoUrl(lesson.videoUrl || '');
    setNewLessonDuration(lesson.duration || '');
    setShowLessonDialog(true);
  };

  // Handle adding a new lesson
  const handleAddLesson = (moduleIndex: number) => {
    setEditingLesson({ moduleIndex });
    setNewLessonTitle('');
    setNewLessonDescription('');
    setNewLessonVideoUrl('');
    setNewLessonDuration('');
    setShowLessonDialog(true);
  };

  // Handle saving lesson changes
  const handleSaveLesson = () => {
    if (!newLessonTitle.trim()) {
      toast.error('Lesson title cannot be empty');
      return;
    }

    // For now, we'll just update the UI since this is a mock implementation
    // In a real app, this would save to the database
    const updatedModules = [...modules];
    
    if (editingLesson.lessonIndex !== undefined) {
      // Update existing lesson
      updatedModules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex] = {
        title: newLessonTitle,
        description: newLessonDescription,
        videoUrl: newLessonVideoUrl,
        duration: newLessonDuration
      };
      toast.success('Lesson updated successfully');
    } else {
      // Add new lesson
      updatedModules[editingLesson.moduleIndex].lessons.push({
        title: newLessonTitle,
        description: newLessonDescription,
        videoUrl: newLessonVideoUrl,
        duration: newLessonDuration
      });
      
      // Update lecture count
      updatedModules[editingLesson.moduleIndex].lectures += 1;
      toast.success('Lesson added successfully');
    }

    // Close dialog
    setShowLessonDialog(false);
    setEditingLesson(null);
    setNewLessonTitle('');
    setNewLessonDescription('');
    setNewLessonVideoUrl('');
    setNewLessonDuration('');
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      toast.success('Exited edit mode');
    } else {
      toast.success('Entered edit mode - you can now modify sections and lessons');
    }
  };
  
  // Course modules data (this would come from the database in a real app)
  const modules = [{
    title: 'Introduction',
    lectures: 2,
    duration: '6min',
    lessons: [{
      title: 'What is .NET?',
      duration: '04:12',
      description: '.NET is the runtime that C# programs are built with and run on.',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }, {
      title: 'Setting up environment',
      duration: '01:48',
      description: 'Setting up your development environment for .NET development',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }]
  }, {
    title: 'Getting Started with ASP.NET Core',
    lectures: 4,
    duration: '15min',
    lessons: [{
      title: 'What is ASP.NET Core?',
      duration: '03:45',
      description: 'Introduction to ASP.NET Core framework',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }, {
      title: 'What Will You Learn in this Course?',
      duration: '04:20',
      description: 'Overview of the course content and learning objectives',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }, {
      title: 'What We Are Building',
      duration: '05:15',
      description: 'Preview of the project we will build throughout the course',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }]
  }, {
    title: 'Environment Configuration',
    lectures: 3,
    duration: '12min',
    lessons: [{
      title: 'Setting up Visual Studio',
      duration: '04:12',
      description: 'Configuring Visual Studio for ASP.NET Core development',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }, {
      title: 'Installing Required Packages',
      duration: '03:48',
      description: 'Installing NuGet packages needed for the project',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }, {
      title: 'Project Structure Overview',
      duration: '04:00',
      description: 'Understanding the structure of an ASP.NET Core project',
      videoUrl: 'https://www.youtube.com/embed/eIHKZfgddLM'
    }]
  }];

  if (loading) {
    return (
      <div className="min-h-screen bg-edu-dark text-white flex items-center justify-center">
        <div className="animate-pulse text-edu-purple">Loading course content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edu-dark text-white flex flex-col md:flex-row">
      {/* Sidebar - Course Contents */}
      <div className="w-full md:w-80 md:min-h-screen bg-edu-dark border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <Link to={`/courses/${id}`} className="text-white hover:text-edu-purple flex items-center">
            <ChevronLeft size={18} className="mr-1" />
            <span><TranslatedText text="Back to Course" /></span>
          </Link>
          <span className="text-edu-purple">{calculateProgress()}% <TranslatedText text="complete" /></span>
        </div>
        
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-bold">{course?.title || "Course Title"}</h1>
          <div className="flex items-center gap-2">
            <FullLanguageSwitcher variant="ghost" size="icon" />
            {isCreator && (
              <Button 
                onClick={toggleEditMode} 
                variant="ghost" 
                size="sm"
                className={isEditMode ? "text-edu-purple" : "text-gray-400"}
              >
                <Edit size={16} className="mr-1" />
                {isEditMode ? <TranslatedText text="Exit Edit" /> : <TranslatedText text="Edit" />}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 bg-edu-card-bg border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold"><TranslatedText text="Course content" /></h2>
            {isCreator && isEditMode && (
              <Button onClick={handleAddSection} variant="ghost" size="sm" className="text-edu-purple">
                <Plus size={16} className="mr-1" />
                <TranslatedText text="Add Section" />
              </Button>
            )}
          </div>
          
          <div className="course-sections">
            {modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border-b border-gray-700">
                <div className="flex justify-between items-center hover:bg-edu-card-bg/50">
                  <button 
                    onClick={() => toggleSection(moduleIndex)}
                    className="flex-1 p-4 flex justify-between items-center text-left"
                  >
                    <div>
                      <h3 className="font-medium">Section {moduleIndex + 1}: {module.title}</h3>
                      <p className="text-xs text-gray-400">
                        {module.lectures} lectures • {module.duration}
                      </p>
                    </div>
                    <ChevronRight 
                      size={18} 
                      className={`transform transition-transform ${expandedSections[moduleIndex] ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  
                  {isCreator && isEditMode && (
                    <div className="flex pr-2">
                      <Button 
                        onClick={() => handleEditSection(module, moduleIndex)} 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-edu-purple"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  )}
                </div>
                
                {expandedSections[moduleIndex] && (
                  <div className="bg-edu-dark/70">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive = activeLesson?.title === lesson.title;
                      const isCompleted = userProgress[`${moduleIndex}-${lessonIndex}`];
                      
                      return (
                        <div key={lessonIndex} className="flex items-start">
                          <button
                            onClick={() => selectLesson(module, lesson, moduleIndex, lessonIndex)}
                            className={`flex-1 p-3 pl-8 flex items-start text-left hover:bg-edu-card-bg/30 
                              ${isActive ? 'bg-edu-card-bg/50' : ''}`}
                          >
                            <div className="mr-3 mt-1">
                              {isCompleted ? (
                                <CheckCircle size={16} className="text-edu-purple" />
                              ) : (
                                <Play size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400">{lesson.duration}</p>
                            </div>
                          </button>
                          
                          {isCreator && isEditMode && (
                            <Button 
                              onClick={() => handleEditLesson(module, lesson, moduleIndex, lessonIndex)} 
                              variant="ghost" 
                              size="sm"
                              className="py-3 px-2 text-gray-400 hover:text-edu-purple"
                            >
                              <Edit size={14} />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    
                    {isCreator && isEditMode && (
                      <div className="pl-8 pr-4 py-2">
                        <Button 
                          onClick={() => handleAddLesson(moduleIndex)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-gray-400 border-dashed border-gray-600"
                        >
                          <Plus size={14} className="mr-1" />
                          Add Lesson
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <Progress value={calculateProgress()} className="h-2 mb-2" />
          <p className="text-sm text-gray-400">{calculateProgress()}% <TranslatedText text="complete" /></p>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Navigation */}
        <div className="bg-black p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ChevronLeft size={18} className="mr-1" />
              <TranslatedText text="Previous" />
            </Button>
            <Separator orientation="vertical" className="h-5 mx-2 bg-gray-700" />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <TranslatedText text="Next" />
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
          <div className="flex gap-2">
            <FullLanguageSwitcher variant="ghost" size="sm" />
            <Button variant="ghost" size="sm">
              <MessageSquare size={16} className="mr-1" />
              <TranslatedText text="Q&A" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 size={16} />
            </Button>
          </div>
        </div>
        
        {/* Video Player Area */}
        {activeLesson ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-black aspect-video w-full flex items-center justify-center">
              <iframe
                src={activeLesson.videoUrl}
                title={activeLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">{activeLesson.title}</h1>
                <p className="text-gray-300 mb-4">{activeLesson.description}</p>
                
                <div className="flex gap-2 mb-6">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download size={16} className="mr-2" />
                    Resources
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ExternalLink size={16} className="mr-2" />
                    Transcript
                  </Button>
                </div>
                
                <div className="bg-edu-card-bg p-4 rounded-lg mb-6">
                  <h2 className="font-bold mb-2">About this lesson</h2>
                  <p className="text-sm text-gray-300">
                    This lesson introduces the core concepts of the module and provides a foundation for the following lessons.
                    Make sure to follow along with the code examples provided in the resources section.
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <ThumbsUp size={16} className="mr-2" />
                      Helpful
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <MessageSquare size={16} className="mr-2" />
                      Comment
                    </Button>
                  </div>
                  <Button variant="default" size="sm" className="bg-edu-purple">
                    Mark as complete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Select a lesson to start learning</h2>
              <p className="text-gray-400">Choose a lesson from the course content sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* Section Edit Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="section-title" className="text-sm font-medium">
                Section Title
              </label>
              <Input
                id="section-title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="e.g. Introduction to Course"
                className="bg-edu-dark"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-edu-purple" onClick={handleSaveSection}>
              {editingSection ? 'Update Section' : 'Add Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Edit Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson?.lessonIndex !== undefined ? 'Edit Lesson' : 'Add New Lesson'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="lesson-title" className="text-sm font-medium">
                Lesson Title
              </label>
              <Input
                id="lesson-title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="e.g. What is .NET?"
                className="bg-edu-dark"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lesson-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="lesson-description"
                value={newLessonDescription}
                onChange={(e) => setNewLessonDescription(e.target.value)}
                placeholder="Brief description of this lesson"
                className="bg-edu-dark"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lesson-video" className="text-sm font-medium">
                Video URL
              </label>
              <Input
                id="lesson-video"
                value={newLessonVideoUrl}
                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/embed/..."
                className="bg-edu-dark"
              />
              <p className="text-xs text-gray-400">
                Use YouTube embed URLs for best compatibility
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lesson-duration" className="text-sm font-medium">
                Duration
              </label>
              <Input
                id="lesson-duration"
                value={newLessonDuration}
                onChange={(e) => setNewLessonDuration(e.target.value)}
                placeholder="e.g. 04:30"
                className="bg-edu-dark w-32"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-edu-purple" onClick={handleSaveLesson}>
              {editingLesson?.lessonIndex !== undefined ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearn;
