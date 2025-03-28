
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';
import { useYouTubeAPI } from '@/hooks/useYoutubeAPI';
import { useGoogleAPI } from '@/hooks/useGoogleAPI';

// Import new components
import SearchBar from '@/components/courseCatalog/SearchBar';
import SearchResults from '@/components/courseCatalog/SearchResults';


const CourseCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  
  const {
    videos,
    isLoading: isLoadingVideos,
    error: videoError,
    fetchVideos
  } = useYouTubeAPI();
  
  const {
    documents,
    isLoading: isLoadingDocs,
    error: docError,
    fetchDocuments
  } = useGoogleAPI();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search field is empty",
        description: "Please enter a search term to find educational content.",
        variant: "destructive"
      });
      return;
    }
    setSearchTerm(searchQuery);
    fetchVideos(searchQuery);
    fetchDocuments(searchQuery);
    setActiveTab('search');
  };

  const formatDuration = (duration: string) => {
    // YouTube API returns duration in ISO 8601 format (PT#M#S)
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "Unknown";
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <Header />
        
        {/* Search Bar Component */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        <Tabs defaultValue="explore" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-edu-card-bg mb-4">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="search">Search Results</TabsTrigger>
          </TabsList>
          
          
          <TabsContent value="search">
            {/* Search Results Component */}
            <SearchResults 
              searchTerm={searchTerm}
              videos={videos}
              isLoadingVideos={isLoadingVideos}
              videoError={videoError}
              documents={documents}
              isLoadingDocs={isLoadingDocs}
              docError={docError}
              fetchVideos={fetchVideos}
              fetchDocuments={fetchDocuments}
              formatDuration={formatDuration}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CourseCatalog;