
import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  Upload, 
  Users, 
  FileText, 
  BarChart2, 
  MessageSquare,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  File,
  Film,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import DashboardHeader from '@/components/student/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Add the missing getFileType function
const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map common file extensions to file types
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
    return 'video';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'document';
  } else if (['ppt', 'pptx'].includes(extension)) {
    return 'presentation';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'spreadsheet';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'archive';
  } else {
    return 'other';
  }
};

const EducatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [currentCourse, setCurrentCourse] = useState('');
  
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchMaterials();
    }
  }, [user]);
  
  const fetchCourses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('created_by', user.id);
        
      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0 && !currentCourse) {
        setCurrentCourse(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error fetching courses",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const fetchMaterials = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('created_by', user.id);
        
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error fetching materials",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a course.",
        variant: "destructive",
      });
      return;
    }
    
    if (!courseTitle.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter a course title.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          { 
            title: courseTitle, 
            description: courseDescription, 
            created_by: user.id 
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Course Created",
        description: "Your new course has been successfully created.",
      });
      
      setCourseTitle('');
      setCourseDescription('');
      fetchCourses();
      
      if (data && data.length > 0) {
        setCurrentCourse(data[0].id);
      }
      
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error Creating Course",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <Film className="text-blue-400" />;
      case 'pdf': return <FileText className="text-red-400" />;
      default: return <File className="text-gray-400" />;
    }
  };
  
  const handleViewMaterial = (material: any) => {
    toast({
      title: "Viewing Material",
      description: `Opening ${material.file_name}...`,
    });
  };
  
  const handleDownloadMaterial = async (material: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('course_materials')
        .download(material.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: `Downloading ${material.file_name}...`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteMaterial = async (material: any) => {
    if (!confirm(`Are you sure you want to delete ${material.file_name}?`)) {
      return;
    }
    
    try {
      const { error: storageError } = await supabase.storage
        .from('course_materials')
        .remove([material.file_path]);
        
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', material.id);
        
      if (dbError) throw dbError;
      
      setMaterials(materials.filter(m => m.id !== material.id));
      
      toast({
        title: "Material Deleted",
        description: `${material.file_name} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Deletion Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload materials.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentCourse) {
      toast({
        title: "Course Required",
        description: "Please select or create a course first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Files Required",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${currentCourse}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course_materials')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { error: dbError } = await supabase
          .from('course_materials')
          .insert([
            {
              course_id: currentCourse,
              file_path: filePath,
              file_name: file.name,
              file_type: getFileType(file.name),
              file_size: file.size,
              created_by: user.id
            }
          ]);
          
        if (dbError) throw dbError;
        
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      
      toast({
        title: "Upload Complete",
        description: "Your materials have been successfully uploaded.",
      });
      
      setSelectedFiles(null);
      fetchMaterials();
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  const enrollmentData = [
    { month: 'Jan', students: 12 },
    { month: 'Feb', students: 19 },
    { month: 'Mar', students: 25 },
    { month: 'Apr', students: 31 },
    { month: 'May', students: 37 },
    { month: 'Jun', students: 42 },
  ];
  
  const progressData = [
    { course: 'Python Basics', completed: 85 },
    { course: 'Web Development', completed: 62 },
    { course: 'Data Science', completed: 45 },
    { course: 'Machine Learning', completed: 30 },
  ];
  
  const students = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', progress: 75 },
    { id: 2, name: 'Sam Smith', email: 'sam@example.com', progress: 45 },
    { id: 3, name: 'Jamie Williams', email: 'jamie@example.com', progress: 90 },
    { id: 4, name: 'Casey Brown', email: 'casey@example.com', progress: 60 },
  ];
  
  const discussions = [
    { id: 1, author: 'Taylor Lee', content: 'When will the next assignment be posted?', date: '2h ago', status: 'pending' },
    { id: 2, author: 'Jordan Smith', content: 'I need help with question 3 on the latest quiz.', date: '5h ago', status: 'pending' },
    { id: 3, author: 'Alex Johnson', content: 'Great lecture yesterday! Looking forward to more content.', date: '1d ago', status: 'approved' },
  ];
  
  const handleModeration = (id: number, action: 'approve' | 'flag') => {
    toast({
      title: action === 'approve' ? "Comment Approved" : "Comment Flagged",
      description: `The comment has been ${action === 'approve' ? 'approved' : 'flagged'}.`,
    });
  };

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <DashboardHeader 
          title="Educator Dashboard" 
          description="Manage your courses, students, and more"
        />
        
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid h-40 grid-cols-3 bg-edu-card-bg mb-6">
            <TabsTrigger value="upload" className="flex flex-col items-center gap-1 py-3">
              <Upload size={18} />
              <span className="text-xs">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col items-center gap-1 py-3">
              <Users size={18} />
              <span className="text-xs">Students</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex flex-col items-center gap-1 py-3">
              <FileText size={18} />
              <span className="text-xs">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-3">
              <BarChart2 size={18} />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex flex-col items-center gap-1 py-3">
              <MessageSquare size={18} />
              <span className="text-xs">Moderation</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription className="text-gray-400">Set up a new course before uploading materials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input 
                      id="title" 
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Introduction to Mathematics" 
                      className="bg-edu-dark/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description</Label>
                    <Textarea 
                      id="description" 
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Describe your course content and learning objectives..." 
                      className="bg-edu-dark/50 min-h-[100px]" 
                    />
                  </div>
                  <Button type="submit" className="w-full bg-edu-purple hover:bg-edu-purple-light">
                    Create Course
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Upload Course Materials</CardTitle>
                <CardDescription className="text-gray-400">Upload videos, PDFs, and other learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  {courses.length > 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor="course">Select Course</Label>
                      <select 
                        id="course"
                        value={currentCourse}
                        onChange={(e) => setCurrentCourse(e.target.value)}
                        className="w-full rounded-md bg-edu-dark/50 px-3 py-2 text-white"
                      >
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/30 text-yellow-400 p-4 rounded-md">
                      Please create a course first before uploading materials.
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">Drag and drop files here, or click to browse</p>
                    <input 
                      id="file-upload" 
                      type="file" 
                      multiple
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Select Files
                    </Button>
                    
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm text-gray-400 mb-2">Selected files:</p>
                        <ul className="space-y-2">
                          {Array.from(selectedFiles).map((file, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              {getFileIcon(getFileType(file.name))}
                              <span>{file.name}</span>
                              <span className="text-gray-500 text-xs">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-edu-purple hover:bg-edu-purple-light"
                    disabled={uploading || !selectedFiles || selectedFiles.length === 0 || !currentCourse}
                  >
                    {uploading ? 'Uploading...' : 'Upload Materials'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Your Course Materials</CardTitle>
                <CardDescription className="text-gray-400">
                  All your uploaded learning resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materials.length > 0 ? (
                  <Table>
                    <TableCaption>A list of your uploaded course materials</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            {getFileIcon(material.file_type)}
                            {material.file_name}
                          </TableCell>
                          <TableCell>{material.file_type}</TableCell>
                          <TableCell>{formatFileSize(material.file_size)}</TableCell>
                          <TableCell>{formatDate(material.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewMaterial(material)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDownloadMaterial(material)}
                                className="h-8 w-8 p-0"
                              >
                                <Download size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteMaterial(material)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8 text-gray-400">
                    <File className="mx-auto h-10 w-10 mb-2" />
                    <p>No materials uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader className="flex flex-col items-center justify-between">
                <div>
                  <CardTitle>Manage Enrolled Students</CardTitle>
                  <CardDescription className="text-gray-400">View and manage your student roster</CardDescription>
                </div>
                <div className="flex items-center">
                  <Input placeholder="Search students..." className="mr-2 bg-edu-dark/50 w-40 md:w-60" />
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Search size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex flex-col items-center justify-center p-3 bg-edu-dark/30 rounded-lg">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-400">{student.email}</p>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-40">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{student.progress}%</span>
                          </div>
                          <Progress value={student.progress} className="h-2" />
                        </div>
                        <Button size="sm" variant="outline">Message</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader className="flex flex-col items-center justify-between">
                <div>
                  <CardTitle>Create Assignments & Quizzes</CardTitle>
                  <CardDescription className="text-gray-400">Design and publish assessments for your students</CardDescription>
                </div>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  New Assignment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-edu-dark/30 rounded-lg">
                    <h3 className="font-medium mb-2">Multiple Choice Quiz</h3>
                    <p className="text-sm text-gray-400 mb-4">Create multiple choice questions with automatic grading</p>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Input id="question" placeholder="What is the capital of France?" className="bg-edu-dark/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Paris" className="bg-edu-dark/50" />
                            <Button variant="outline" size="sm">Correct</Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input placeholder="London" className="bg-edu-dark/50" />
                            <Button variant="ghost" size="sm">Set Correct</Button>
                          </div>
                          <Button variant="ghost" className="justify-start">
                            <Plus size={16} className="mr-1" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button className="bg-edu-purple hover:bg-edu-purple-light">
                        Save Question
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Course Analytics & Student Progress</CardTitle>
                <CardDescription className="text-gray-400">Track student engagement and course performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-edu-dark/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-4">Student Enrollment Trends</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentData}>
                          <XAxis dataKey="month" stroke="#9b87f5" />
                          <YAxis stroke="#9b87f5" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1F2C', border: 'none' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="students" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-edu-dark/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-4">Course Completion Rates</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="course" stroke="#9b87f5" />
                          <YAxis stroke="#9b87f5" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1F2C', border: 'none' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="completed" stroke="#9b87f5" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 mt-6 bg-edu-dark/30 p-4 rounded-lg">
                  <div className="text-center p-3">
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-edu-purple">156</p>
                  </div>
                  <div className="text-center p-3">
                    <p className="text-gray-400 text-sm">Active Courses</p>
                    <p className="text-2xl font-bold text-edu-purple">8</p>
                  </div>
                  <div className="text-center p-3">
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-edu-purple">72%</p>
                  </div>
                  <div className="text-center p-3">
                    <p className="text-gray-400 text-sm">Avg. Rating</p>
                    <p className="text-2xl font-bold text-edu-purple">4.7</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="moderation" className="space-y-4">
            <Card className="bg-edu-card-bg border-none">
              <CardHeader>
                <CardTitle>Discussion & Q&A Moderation</CardTitle>
                <CardDescription className="text-gray-400">Manage student discussions and questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discussions.map(discussion => (
                    <div key={discussion.id} className="p-4 bg-edu-dark/30 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{discussion.author}</h3>
                          <p className="text-xs text-gray-400">{discussion.date}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          discussion.status === 'approved' 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {discussion.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-200">{discussion.content}</p>
                      <div className="flex flex-row gap-0 mt-4">
                        {discussion.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleModeration(discussion.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleModeration(discussion.id, 'flag')}
                            >
                              Flag
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="ml-auto">
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default EducatorDashboard;
