
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export function useYouTubeAPI() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the YouTube API key securely via Supabase Edge Function
  const getYouTubeApiKey = async (): Promise<string> => {
    try {
      console.log('Fetching YouTube API key from Edge Function');
      const { data, error } = await supabase.functions.invoke('get-api-keys', {
        body: { service: 'youtube' }
      });
      
      if (error) {
        console.error('Error from Edge Function:', error);
        throw new Error(error.message || 'Failed to fetch API key from server');
      }
      
      if (!data?.apiKey) {
        console.error('No API key in response:', data);
        throw new Error('No API key returned from server. Please ensure the YouTube API key is set in Supabase secrets.');
      }
      
      console.log('Successfully retrieved YouTube API key');
      return data.apiKey;
    } catch (err) {
      console.error('Error fetching YouTube API key:', err);
      throw new Error('Could not access YouTube API key. Please ensure it is configured correctly in Supabase project secrets.');
    }
  };

  const fetchVideos = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let apiKey;
      
      try {
        apiKey = await getYouTubeApiKey();
      } catch (keyError) {
        setError(keyError instanceof Error ? keyError.message : 'Failed to access YouTube API key');
        toast({
          title: "API Key Error",
          description: keyError instanceof Error ? keyError.message : 'Failed to access YouTube API key',
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // First, search for videos
      console.log('Fetching videos for query:', query);
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}+education+tutorial&type=video&relevanceLanguage=en&key=${apiKey}`
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error('YouTube search API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch videos from YouTube');
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.items?.length) {
        setVideos([]);
        setIsLoading(false);
        return;
      }
      
      // Get video IDs from search results
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      // Then, get detailed video information including duration
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,statistics&id=${videoIds}&key=${apiKey}`
      );
      
      if (!videoDetailsResponse.ok) {
        const errorData = await videoDetailsResponse.json();
        console.error('YouTube video details API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch video details from YouTube');
      }
      
      const videoDetails = await videoDetailsResponse.json();
      
      // Map the results to our Video interface
      const formattedVideos: Video[] = videoDetails.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: {
          url: item.snippet.thumbnails.high.url,
          width: item.snippet.thumbnails.high.width,
          height: item.snippet.thumbnails.high.height,
        },
        channelTitle: item.snippet.channelTitle,
        duration: item.contentDetails.duration,
        publishedAt: item.snippet.publishedAt,
      }));
      
      setVideos(formattedVideos);
    } catch (err) {
      console.error('YouTube API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos. Please try again.');
      toast({
        title: "Error fetching videos",
        description: err instanceof Error ? err.message : 'Failed to fetch videos. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { videos, isLoading, error, fetchVideos };
}