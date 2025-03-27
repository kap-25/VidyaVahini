
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define available languages
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' }
];

type LanguageContextType = {
  language: string;
  setLanguage: (code: string) => void;
  translate: (text: string) => Promise<string>;
  translateBatch: (texts: string[]) => Promise<string[]>;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [googleTranslateApiKey, setGoogleTranslateApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // Fetch Google Translate API key from Supabase secrets
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // First check if it's in window.env (for environment variables)
        if ((window as any).env && (window as any).env.GOOGLE_TRANSLATE_API_KEY) {
          setGoogleTranslateApiKey((window as any).env.GOOGLE_TRANSLATE_API_KEY);
          return;
        }
        
        // Otherwise fetch from Supabase
        const response = await supabase.functions.invoke('get-translate-api-key', {
          method: 'GET'
        });
        
        if (response.error) {
          throw new Error(`Failed to fetch API key: ${response.error.message}`);
        }
        
        setGoogleTranslateApiKey(response.data.apiKey);
      } catch (error) {
        console.error('Error fetching translation API key:', error);
      }
    };
    
    fetchApiKey();
  }, []);
  
  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    document.documentElement.lang = language;
  }, [language]);
  
  // Translation function using Google Translate API
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!text || language === 'en') return text; // No need to translate empty text or English
    
    if (!googleTranslateApiKey) {
      console.warn('Google Translate API key not available');
      return text;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: language,
            source: 'en',
            format: 'html', // Support HTML in translations
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations.length > 0) {
        return data.data.translations[0].translatedText;
      }
      
      return text; // Return original text if translation fails
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    } finally {
      setIsLoading(false);
    }
  }, [language, googleTranslateApiKey]);

  // Batch translation function with debounce and caching
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    if (language === 'en' || !texts.length) return texts; // No need to translate English
    if (!googleTranslateApiKey) {
      console.warn('Google Translate API key not available');
      return texts;
    }
    
    // Filter out empty strings to avoid wasting API calls
    const filteredTexts = texts.filter(text => text && text.trim() !== '');
    if (filteredTexts.length === 0) return texts;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: filteredTexts,
            target: language,
            source: 'en',
            format: 'html', // Support HTML in translations
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations.length > 0) {
        // Map back to original array positions
        const translations = data.data.translations.map((t: any) => t.translatedText);
        let translatedIndex = 0;
        return texts.map(text => {
          if (!text || text.trim() === '') return text;
          return translations[translatedIndex++] || text;
        });
      }
      
      return texts; // Return original texts if translation fails
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts if translation fails
    } finally {
      setIsLoading(false);
    }
  }, [language, googleTranslateApiKey]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, translateBatch, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
