
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { File, FileText, Film, Search, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Material {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  course_title: string;
  created_at: string;
}

const MaterialsTab = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();

    // Set up real-time subscription for course materials updates
    const materialsChannel = supabase
      .channel('materials-updates')
      .on('postgres_changes', 
        { 
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'course_materials'
        }, 
        (payload) => {
          console.log('Materials changed:', payload);
          
          // Update the materials list after a change is detected
          fetchMaterials();
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(materialsChannel);
    };
  }, [user]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      // Get all materials with joined course information
      const { data, error } = await supabase
        .from('course_materials')
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          created_at,
          courses:course_id (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to have course_title as a direct property
      const transformedData = data.map(item => ({
        id: item.id,
        file_name: item.file_name,
        file_path: item.file_path,
        file_type: item.file_type,
        file_size: item.file_size,
        course_title: item.courses?.title || 'Unknown Course',
        created_at: item.created_at
      }));

      setMaterials(transformedData);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <Film className="text-blue-400" />;
      case 'pdf': return <FileText className="text-red-400" />;
      default: return <File className="text-gray-400" />;
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('course_materials')
        .download(filePath);
        
      if (error) throw error;
      
      // Create a URL for the downloaded data
      const url = URL.createObjectURL(data);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Downloading ${fileName}`);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const filteredMaterials = materials.filter(material => 
    material.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="bg-edu-card-bg border-none">
        <CardHeader className="flex flex-row-2 items-center justify-between">
          <div>
            <CardTitle>Learning Materials</CardTitle>
            <CardDescription className="text-gray-400">
              Access videos, documents and resources from your courses
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search materials..." 
              className="w-40 md:w-60 bg-edu-dark/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="sm" variant="outline" className="rounded-full">
              <Search size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse text-edu-purple">Loading materials...</div>
            </div>
          ) : filteredMaterials.length > 0 ? (
            <div className="space-y-3">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="bg-edu-dark/30 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileIcon(material.file_type)}
                    <div className="ml-3">
                      <p className="font-medium">{material.file_name}</p>
                      <p className="text-xs text-gray-400">
                        {material.course_title} • {material.file_size ? `${(material.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                        {` • Added on ${new Date(material.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDownload(material.file_path, material.file_name)}
                    className="flex items-center gap-1"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <File className="mx-auto h-10 w-10 mb-2" />
              <p>{searchTerm ? 'No materials matching your search' : 'No materials available yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsTab;
