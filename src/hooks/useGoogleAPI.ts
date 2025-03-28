
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Document {
  title: string;
  link: string;
  snippet: string;
}

export function useGoogleAPI() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the Google API key and Search Engine ID securely via Supabase Edge Function
  const getGoogleApiCredentials = async (): Promise<{apiKey: string, searchEngineId: string}> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-api-keys', {
        body: { service: 'google' }
      });
      
      if (error) throw new Error(error.message);
      if (!data?.apiKey || !data?.searchEngineId) {
        throw new Error('Missing API key or Search Engine ID from server');
      }
      
      return {
        apiKey: data.apiKey,
        searchEngineId: data.searchEngineId
      };
    } catch (err) {
      console.error('Error fetching Google API credentials:', err);
      throw new Error('Failed to fetch Google API credentials');
    }
  };

  const fetchDocuments = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let apiKey, searchEngineId;
      
      try {
        const credentials = await getGoogleApiCredentials();
        apiKey = credentials.apiKey;
        searchEngineId = credentials.searchEngineId;
      } catch (keyError) {
        setError('Could not access Google Search API. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}+educational+resources`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch resources from Google');
      }
      
      const data = await response.json();
      
      if (!data.items?.length) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }
      
      // Map the results to our Document interface
      const formattedDocs: Document[] = data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
      
      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Google API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources. Please try again.');
      toast({
        title: "Error fetching resources",
        description: err instanceof Error ? err.message : 'Failed to fetch resources. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { documents, isLoading, error, fetchDocuments };
}