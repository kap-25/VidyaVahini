
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function useTranslation(text?: string) {
  const { language, translate, setLanguage } = useLanguage();
  const [translated, setTranslated] = useState(text || '');

  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      if (!text) return;
      
      try {
        // Only translate if language is not English
        if (language === 'en') {
          if (isMounted) setTranslated(text);
          return;
        }
        
        const result = await translate(text);
        if (isMounted) {
          setTranslated(result);
        }
      } catch (error) {
        console.error('Error in useTranslation hook:', error);
        if (isMounted) {
          setTranslated(text); // Fallback to original text on error
        }
      }
    };
    
    translateText();
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate]);

  // Return both the translated text and the setLanguage function
  return {
    translated,
    setLanguage,
    language
  };
}

export default useTranslation;
