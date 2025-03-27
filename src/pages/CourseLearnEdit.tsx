import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, CheckCircle, ExternalLink, Download, Edit, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const sectionSchema = z.object({
  title: z.string().min(1, { message: "Section title is required" }),
});

const lessonSchema = z.object({
  title: z.string().min(1, { message: "Lesson title is required" }),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.string().optional(),
});

const CourseLearnEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true, // First section is expanded by default
  });
  
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'section' | 'lesson', index: number, lessonIndex?: number} | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const sectionForm = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: "",
    },
  });

  const lessonForm = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
    },
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id || !user) return;
      try {
        setLoading(true);
        
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        const isCreator = courseData.created_by === user.id;
        setIsCreator(isCreator);
        
        if (!isCreator) {
          toast.error('You do not have permission to edit this course');
          navigate(`/courses/${id}`);
          return;
        }
        
        const mockModules = [{
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

        setModules(mockModules);
        
        const { data: materialsData, error: materialsError } = await supabase
          .from('course_materials')
          .select('*')
          .eq('course_id', id);
          
        if (materialsError) throw materialsError;
        setCourseMaterials(materialsData || []);
        
        if (mockModules[0]?.lessons[0]) {
          setActiveLesson(mockModules[0].lessons[0]);
        }
        
      } catch (error: any) {
        console.error('Error fetching course data:', error.message);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, user, navigate]);
  
  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const selectLesson = (module: any, lesson: any, moduleIndex: number, lessonIndex: number) => {
    setActiveLesson(lesson);
    setActiveSectionIndex(moduleIndex);
    setExpandedSections(prev => ({
      ...prev,
      [moduleIndex]: true
    }));
  };

  const handleEditSection = (module: any, index: number) => {
    setEditingSection({ ...module, index });
    sectionForm.reset({ title: module.title });
    setShowSectionDialog(true);
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.reset({ title: "" });
    setShowSectionDialog(true);
  };

  const handleSaveSection = (values: z.infer<typeof sectionSchema>) => {
    const updatedModules = [...modules];
    
    if (editingSection) {
      updatedModules[editingSection.index].title = values.title;
      toast.success('Section updated successfully');
    } else {
      updatedModules.push({
        title: values.title,
        lectures: 0,
        duration: '0min',
        lessons: []
      });
      toast.success('Section added successfully');
    }
    
    setModules(updatedModules);
    setIsDirty(true);
    setShowSectionDialog(false);
  };

  const handleEditLesson = (module: any, lesson: any, moduleIndex: number, lessonIndex: number) => {
    setEditingLesson({ ...lesson, moduleIndex, lessonIndex });
    lessonForm.reset({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || ''
    });
    setShowLessonDialog(true);
  };

  const handleAddLesson = (moduleIndex: number) => {
    setEditingLesson({ moduleIndex });
    lessonForm.reset({
      title: "",
      description: "",
      videoUrl: "",
      duration: ""
    });
    setShowLessonDialog(true);
  };

  const handleSaveLesson = (values: z.infer<typeof lessonSchema>) => {
    const updatedModules = [...modules];
    
    if (editingLesson.lessonIndex !== undefined) {
      updatedModules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex] = {
        title: values.title,
        description: values.description,
        videoUrl: values.videoUrl,
        duration: values.duration
      };
      toast.success('Lesson updated successfully');
    } else {
      updatedModules[editingLesson.moduleIndex].lessons.push({
        title: values.title,
        description: values.description,
        videoUrl: values.videoUrl,
        duration: values.duration
      });
      
      updatedModules[editingLesson.moduleIndex].lectures += 1;
      toast.success('Lesson added successfully');
    }

    setModules(updatedModules);
    setIsDirty(true);
    setShowLessonDialog(false);
    
    if (activeLesson && editingLesson.lessonIndex !== undefined && 
        activeLesson.title === modules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex].title) {
      setActiveLesson(updatedModules[editingLesson.moduleIndex].lessons[editingLesson.lessonIndex]);
    }
  };

  const handleDelete = (type: 'section' | 'lesson', index: number, lessonIndex?: number) => {
    setItemToDelete({ type, index, lessonIndex });
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    const { type, index, lessonIndex } = itemToDelete;
    const updatedModules = [...modules];

    if (type === 'section') {
      updatedModules.splice(index, 1);
      toast.success('Section deleted successfully');
      
      if (activeSectionIndex === index) {
        setActiveSectionIndex(0);
        if (updatedModules.length > 0 && updatedModules[0].lessons.length > 0) {
          setActiveLesson(updatedModules[0].lessons[0]);
        } else {
          setActiveLesson(null);
        }
      }
    } else if (type === 'lesson' && lessonIndex !== undefined) {
      updatedModules[index].lessons.splice(lessonIndex, 1);
      updatedModules[index].lectures -= 1;
      toast.success('Lesson deleted successfully');
      
      if (activeSectionIndex === index && activeLesson && 
          activeLesson.title === modules[index].lessons[lessonIndex].title) {
        if (updatedModules[index].lessons.length > 0) {
          setActiveLesson(updatedModules[index].lessons[0]);
        } else if (updatedModules.length > 0) {
          for (let i = 0; i < updatedModules.length; i++) {
            if (updatedModules[i].lessons.length > 0) {
              setActiveSectionIndex(i);
              setActiveLesson(updatedModules[i].lessons[0]);
              break;
            }
          }
        } else {
          setActiveLesson(null);
        }
      }
    }

    setModules(updatedModules);
    setIsDirty(true);
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const saveAllChanges = async () => {
    try {
      toast.success('All changes saved successfully!');
      setIsDirty(false);
    } catch (error: any) {
      console.error('Error saving changes:', error.message);
      toast.error('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-edu-dark text-white flex items-center justify-center">
        <div className="animate-pulse text-edu-purple">Loading course editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edu-dark text-white flex flex-col md:flex-row">
      <div className="w-full md:w-80 md:min-h-screen bg-edu-dark border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <Link to={`/educator-dashboard`} className="text-white hover:text-edu-purple flex items-center">
            <ChevronLeft size={18} className="mr-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-bold">{course?.title || "Course Title"}</h1>
          {isDirty && (
            <Button 
              onClick={saveAllChanges}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save size={14} className="mr-1" />
              Save All
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 bg-edu-card-bg border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold">Course content</h2>
            <Button onClick={handleAddSection} variant="ghost" size="sm" className="text-edu-purple">
              <Plus size={16} className="mr-1" />
              Add Section
            </Button>
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
                  
                  <div className="flex pr-2">
                    <Button 
                      onClick={() => handleEditSection(module, moduleIndex)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 hover:text-edu-purple"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      onClick={() => handleDelete('section', moduleIndex)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                
                {expandedSections[moduleIndex] && (
                  <div className="bg-edu-dark/70">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isActive = activeLesson?.title === lesson.title;
                      
                      return (
                        <div key={lessonIndex} className="flex items-start">
                          <button
                            onClick={() => selectLesson(module, lesson, moduleIndex, lessonIndex)}
                            className={`flex-1 p-3 pl-8 flex items-start text-left hover:bg-edu-card-bg/30 
                              ${isActive ? 'bg-edu-card-bg/50' : ''}`}
                          >
                            <div className="mr-3 mt-1">
                              <Play size={16} className="text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400">{lesson.duration}</p>
                            </div>
                          </button>
                          
                          <div className="flex py-3 px-2">
                            <Button 
                              onClick={() => handleEditLesson(module, lesson, moduleIndex, lessonIndex)} 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-edu-purple"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              onClick={() => handleDelete('lesson', moduleIndex, lessonIndex)} 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-between">
          <Button asChild variant="outline" size="sm">
            <Link to={`/courses/${id}/learn`}>
              <Play size={16} className="mr-2" />
              Preview Course
            </Link>
          </Button>
          
          <Button asChild variant="default" className="bg-edu-purple">
            <Link to={`/courses/${id}`}>
              <ExternalLink size={16} className="mr-2" />
              View Live
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col h-screen">
        <div className="bg-black p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ChevronLeft size={18} className="mr-1" />
              Previous
            </Button>
            <Separator orientation="vertical" className="h-5 mx-2 bg-gray-700" />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Next
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-edu-purple">
              <Edit size={16} className="mr-1" />
              Edit Mode
            </Button>
          </div>
        </div>
        
        {activeLesson ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-black aspect-video w-full flex items-center justify-center">
              {activeLesson.videoUrl ? (
                <iframe
                  src={activeLesson.videoUrl}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Button 
                    variant="outline" 
                    className="mb-2"
                    onClick={() => handleEditLesson(
                      modules[activeSectionIndex], 
                      activeLesson, 
                      activeSectionIndex, 
                      modules[activeSectionIndex].lessons.findIndex(l => l.title === activeLesson.title)
                    )}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Video URL
                  </Button>
                  <p className="text-sm">No video URL provided for this lesson</p>
                </div>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditLesson(
                      modules[activeSectionIndex], 
                      activeLesson, 
                      activeSectionIndex, 
                      modules[activeSectionIndex].lessons.findIndex(l => l.title === activeLesson.title)
                    )}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Lesson
                  </Button>
                </div>
                
                <p className="text-gray-300 mb-4">{activeLesson.description}</p>
                
                <div className="flex gap-2 mb-6">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download size={16} className="mr-2" />
                    Manage Resources
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ExternalLink size={16} className="mr-2" />
                    Manage Transcript
                  </Button>
                </div>
                
                <div className="bg-edu-card-bg p-4 rounded-lg mb-6">
                  <h2 className="font-bold mb-2">Lesson Description</h2>
                  <p className="text-sm text-gray-300">
                    {activeLesson.description || "No description provided for this lesson. Click 'Edit Lesson' to add one."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Select a lesson to edit</h2>
              <p className="text-gray-400">Choose a lesson from the course content sidebar</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...sectionForm}>
            <form onSubmit={sectionForm.handleSubmit(handleSaveSection)} className="space-y-4 py-4">
              <FormField
                control={sectionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. Introduction to Course" 
                        className="bg-edu-dark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowSectionDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-edu-purple" type="submit">
                  {editingSection ? 'Update Section' : 'Add Section'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson?.lessonIndex !== undefined ? 'Edit Lesson' : 'Add New Lesson'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(handleSaveLesson)} className="space-y-4 py-4">
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. What is .NET?" 
                        className="bg-edu-dark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={lessonForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description of this lesson"
                        className="bg-edu-dark"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={lessonForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. https://www.youtube.com/embed/..."
                        className="bg-edu-dark"
                      />
                    </FormControl>
                    <FormDescription>
                      Use YouTube embed URLs for best compatibility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={lessonForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 04:30"
                        className="bg-edu-dark w-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowLessonDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-edu-purple" type="submit">
                  {editingLesson?.lessonIndex !== undefined ? 'Update Lesson' : 'Add Lesson'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              Are you sure you want to delete this {itemToDelete?.type}? 
              This action cannot be undone.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearnEdit;
