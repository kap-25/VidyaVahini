
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Upload, X, FileText, Film, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const materialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  section: z.string().min(1, "Section is required"),
});

const youtubeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  section: z.string().min(1, "Section is required"),
  youtubeUrl: z.string().min(1, "YouTube URL is required")
    .refine(
      (url) => {
        // Basic validation for YouTube URLs
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(url);
      },
      {
        message: "Please enter a valid YouTube URL",
      }
    ),
});

type MaterialFormValues = z.infer<typeof materialSchema>;
type YoutubeFormValues = z.infer<typeof youtubeSchema>;

const CourseContentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [sections, setSections] = useState<string[]>(['Introduction', 'Core Concepts', 'Advanced Topics', 'Conclusion']);
  const [editMode, setEditMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("file");

  const materialForm = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: "",
      description: "",
      section: "Introduction",
    },
  });

  const youtubeForm = useForm<YoutubeFormValues>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      title: "",
      description: "",
      section: "Introduction",
      youtubeUrl: "",
    },
  });

  useEffect(() => {
    if (!id || !user) return;
    fetchCourseDetails();
  }, [id, user]);
  
  useEffect(() => {
    if (editingMaterial) {
      if (editingMaterial.file_type === 'youtube') {
        youtubeForm.reset({
          title: editingMaterial.file_name,
          description: editingMaterial.description || '',
          section: editingMaterial.section || 'Introduction',
          youtubeUrl: editingMaterial.file_path || '',
        });
        setActiveTab("youtube");
      } else {
        materialForm.reset({
          title: editingMaterial.file_name,
          description: editingMaterial.description || '',
          section: editingMaterial.section || 'Introduction',
        });
        setActiveTab("file");
      }
    } else {
      materialForm.reset({
        title: "",
        description: "",
        section: "Introduction",
      });
      youtubeForm.reset({
        title: "",
        description: "",
        section: "Introduction",
        youtubeUrl: "",
      });
    }
  }, [editingMaterial]);

  const fetchCourseDetails = async () => {
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
      
      // Check if the user is the creator of the course
      const isCreator = courseData.created_by === user.id;
      setIsCreator(isCreator);
      
      if (!isCreator) {
        toast.error("You don't have permission to edit this course");
        navigate(`/courses/${id}`);
        return;
      }
      
      // Fetch course materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)
        .order('created_at', { ascending: true });
      
      if (materialsError) throw materialsError;
      
      setMaterials(materialsData || []);
      
    } catch (error: any) {
      console.error('Error fetching course details:', error.message);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const openAddMaterialDialog = () => {
    setEditMode(false);
    setEditingMaterial(null);
    setSelectedFile(null);
    materialForm.reset({
      title: "",
      description: "",
      section: "Introduction",
    });
    youtubeForm.reset({
      title: "",
      description: "",
      section: "Introduction",
      youtubeUrl: "",
    });
    setActiveTab("file");
    setShowAddMaterialDialog(true);
  };

  const openEditMaterialDialog = (material: any) => {
    setEditMode(true);
    setEditingMaterial(material);
    setShowAddMaterialDialog(true);
  };

  const onSubmitMaterial = async (values: MaterialFormValues) => {
    if (!user || !id) return;
    
    try {
      setUploadLoading(true);
      
      if (editMode && editingMaterial) {
        // Update existing material
        const { error } = await supabase
          .from('course_materials')
          .update({
            file_name: values.title,
            description: values.description,
            section: values.section
          })
          .eq('id', editingMaterial.id);
        
        if (error) throw error;
        
        toast.success("Material updated successfully");
        setShowAddMaterialDialog(false);
        fetchCourseDetails();
        return;
      }
      
      if (!selectedFile) {
        toast.error("Please select a file to upload");
        return;
      }
      
      // Determine file type
      let fileType = 'document';
      if (selectedFile.type.startsWith('video/')) {
        fileType = 'video';
      } else if (selectedFile.type === 'application/pdf') {
        fileType = 'pdf';
      }
      
      // Upload file to storage
      const filePath = `${id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('course_materials')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Add record to course_materials table
      const { error: insertError } = await supabase
        .from('course_materials')
        .insert({
          course_id: id,
          file_name: values.title,
          file_type: fileType,
          file_path: filePath,
          file_size: selectedFile.size,
          created_by: user.id,
          description: values.description,
          section: values.section
        });
      
      if (insertError) throw insertError;
      
      toast.success("Material added successfully");
      setShowAddMaterialDialog(false);
      setSelectedFile(null);
      fetchCourseDetails();
      
    } catch (error: any) {
      console.error('Error uploading material:', error.message);
      toast.error('Failed to upload material');
    } finally {
      setUploadLoading(false);
    }
  };

  const onSubmitYoutubeVideo = async (values: YoutubeFormValues) => {
    if (!user || !id) return;
    
    try {
      setUploadLoading(true);
      
      if (editMode && editingMaterial) {
        // Update existing youtube video
        const { error } = await supabase
          .from('course_materials')
          .update({
            file_name: values.title,
            description: values.description,
            section: values.section,
            file_path: values.youtubeUrl
          })
          .eq('id', editingMaterial.id);
        
        if (error) throw error;
        
        toast.success("YouTube video updated successfully");
        setShowAddMaterialDialog(false);
        fetchCourseDetails();
        return;
      }
      
      // Add record to course_materials table
      const { error: insertError } = await supabase
        .from('course_materials')
        .insert({
          course_id: id,
          file_name: values.title,
          file_type: 'youtube',
          file_path: values.youtubeUrl,
          file_size: 0, // No file size for YouTube videos
          created_by: user.id,
          description: values.description,
          section: values.section
        });
      
      if (insertError) throw insertError;
      
      toast.success("YouTube video added successfully");
      setShowAddMaterialDialog(false);
      fetchCourseDetails();
      
    } catch (error: any) {
      console.error('Error adding YouTube video:', error.message);
      toast.error('Failed to add YouTube video');
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteMaterial = async (materialId: string, filePath: string, fileType: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    
    try {
      // Only delete from storage if it's not a YouTube video
      if (fileType !== 'youtube') {
        const { error: deleteStorageError } = await supabase.storage
          .from('course_materials')
          .remove([filePath]);
        
        if (deleteStorageError) {
          console.error('Error deleting file from storage:', deleteStorageError.message);
        }
      }
      
      // Delete record from course_materials table
      const { error: deleteRecordError } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', materialId);
      
      if (deleteRecordError) throw deleteRecordError;
      
      toast.success("Material deleted successfully");
      fetchCourseDetails();
      
    } catch (error: any) {
      console.error('Error deleting material:', error.message);
      toast.error('Failed to delete material');
    }
  };

  const groupMaterialsBySection = () => {
    const grouped: Record<string, any[]> = {};
    
    // Initialize groups with empty arrays for all sections
    sections.forEach(section => {
      grouped[section] = [];
    });
    
    // Add materials to their respective sections
    materials.forEach(material => {
      const section = material.section || 'Introduction';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(material);
    });
    
    return grouped;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Film className="text-blue-400" />;
      case 'youtube':
        return <Youtube className="text-red-500" />;
      case 'pdf':
        return <FileText className="text-red-400" />;
      default:
        return <FileText className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-edu-purple">Loading course editor...</div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl mb-4">You don't have permission to edit this course</p>
        <Button onClick={() => navigate(`/courses/${id}`)}>
          Return to Course
        </Button>
      </div>
    );
  }

  const groupedMaterials = groupMaterialsBySection();

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course Content</h1>
        <Button onClick={() => navigate(`/courses/${id}`)} variant="outline">
          Back to Course
        </Button>
      </div>
      
      <div className="bg-edu-card-bg p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{course?.title}</h2>
        <p className="text-gray-300 mb-4">{course?.description}</p>
      </div>
      
      <div className="bg-edu-card-bg p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Course Materials</h2>
          <Button onClick={openAddMaterialDialog} className="bg-edu-purple">
            <Plus size={16} className="mr-2" />
            Add Material
          </Button>
        </div>
        
        {Object.entries(groupedMaterials).map(([section, sectionMaterials]) => (
          <div key={section} className="mb-6">
            {sectionMaterials.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-2">{section}</h3>
                <div className="space-y-3">
                  {sectionMaterials.map(material => (
                    <Card key={material.id} className="bg-edu-dark/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {getFileIcon(material.file_type)}
                            </div>
                            <div>
                              <div className="font-medium">{material.file_name}</div>
                              <div className="text-xs text-gray-400">
                                {material.description || 'No description'} 
                                {material.file_type === 'youtube' && (
                                  <span className="ml-2 text-red-400">YouTube</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openEditMaterialDialog(material)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => deleteMaterial(material.id, material.file_path, material.file_type)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        
        {materials.length === 0 && (
          <div className="text-center py-8 bg-edu-dark/30 rounded-lg">
            <p className="mb-4">No materials have been added to this course yet.</p>
            <Button onClick={openAddMaterialDialog} className="bg-edu-purple">
              <Plus size={16} className="mr-2" />
              Add Your First Material
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={showAddMaterialDialog} onOpenChange={setShowAddMaterialDialog}>
        <DialogContent className="bg-edu-card-bg">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Edit Material' : 'Add Course Material'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="file" disabled={editMode && editingMaterial?.file_type === 'youtube'}>
                Upload File
              </TabsTrigger>
              <TabsTrigger value="youtube" disabled={editMode && editingMaterial?.file_type !== 'youtube'}>
                YouTube Video
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file">
              <Form {...materialForm}>
                <form onSubmit={materialForm.handleSubmit(onSubmitMaterial)} className="space-y-4">
                  <FormField
                    control={materialForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction to the course" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={materialForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the material" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={materialForm.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full rounded-md bg-edu-dark/50 px-3 py-2 text-white"
                            {...field}
                          >
                            {sections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!editMode && (
                    <div className="border border-dashed border-gray-500 rounded-md p-4">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 mb-2">
                          {selectedFile ? selectedFile.name : 'Upload your material file'}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          Supports PDF, videos, and documents
                        </p>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="file-upload">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            Select File
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddMaterialDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-edu-purple" 
                      disabled={uploadLoading || (!editMode && !selectedFile)}
                    >
                      {uploadLoading ? 'Processing...' : editMode ? 'Update' : 'Upload'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="youtube">
              <Form {...youtubeForm}>
                <form onSubmit={youtubeForm.handleSubmit(onSubmitYoutubeVideo)} className="space-y-4">
                  <FormField
                    control={youtubeForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction Video" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={youtubeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the video" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={youtubeForm.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full rounded-md bg-edu-dark/50 px-3 py-2 text-white"
                            {...field}
                          >
                            {sections.map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={youtubeForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAddMaterialDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-edu-purple" 
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? 'Processing...' : editMode ? 'Update' : 'Add YouTube Video'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseContentEditor;
