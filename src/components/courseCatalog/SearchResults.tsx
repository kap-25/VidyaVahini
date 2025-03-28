
import React from 'react';
import { BookOpen, FileText, Clock, ArrowRight, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
  duration: string;
  publishedAt: string;
}

interface Document {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResultsProps {
  searchTerm: string;
  videos: Video[];
  isLoadingVideos: boolean;
  videoError: string | null;
  documents: Document[];
  isLoadingDocs: boolean;
  docError: string | null;
  fetchVideos: (query: string) => void;
  fetchDocuments: (query: string) => void;
  formatDuration: (duration: string) => string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchTerm,
  videos,
  isLoadingVideos,
  videoError,
  documents,
  isLoadingDocs,
  docError,
  fetchVideos,
  fetchDocuments,
  formatDuration
}) => {
  return (
    <>
      {searchTerm ? (
        <>
          {/* YouTube Videos Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-2" size={20} />
              Educational Videos for "{searchTerm}"
            </h2>
            
            {isLoadingVideos ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-edu-purple mx-auto"></div>
                <p className="mt-3 text-muted-foreground">Searching for videos...</p>
              </div>
            ) : videoError ? (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={24} />
                  <p className="mb-2">{videoError}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    This is likely due to a configuration issue with the YouTube API key.
                  </p>
                  <Button onClick={() => fetchVideos(searchTerm)} variant="outline" className="mt-3 border-white/20">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : videos.length > 0 ? (
              <div className="space-y-4">
                {videos.map(video => (
                  <Card key={video.id} className="bg-edu-card-bg border-none overflow-hidden">
                    <CardContent className="p-3">
                      <div className="relative">
                        <img src={video.thumbnail.url} alt={video.title} className="w-full rounded-lg object-cover h-48" />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <h3 className="font-medium text-lg mt-3">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{video.channelTitle}</p>
                      <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="text-edu-purple hover:underline inline-flex items-center">
                        Watch Video <ArrowRight size={16} className="ml-1" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText size={40} className="mx-auto mb-3" />
                <p>No videos found for "{searchTerm}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </section>

          {/* Educational Resources Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Educational Resources
            </h2>
            
            {isLoadingDocs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-edu-purple mx-auto"></div>
                <p className="mt-3 text-muted-foreground">Searching for resources...</p>
              </div>
            ) : docError ? (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={24} />
                  <p className="mb-2">{docError}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    This is likely due to a configuration issue with the Google API key.
                  </p>
                  <Button onClick={() => fetchDocuments(searchTerm)} variant="outline" className="mt-3 border-white/20">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <a key={index} href={doc.link} target="_blank" rel="noopener noreferrer" className="block bg-edu-card-bg rounded-xl p-4 hover:bg-opacity-80 transition-all">
                    <div className="flex items-center">
                      <FileText className="mr-3 text-edu-purple" size={20} />
                      <h3 className="font-medium text-lg">{doc.title}</h3>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText size={40} className="mx-auto mb-3" />
                <p>No resources found for "{searchTerm}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Search size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Search for educational content</h3>
          <p>Enter a topic in the search box above to find videos and resources</p>
        </div>
      )}
    </>
  );
};

export default SearchResults;