
import React, { ReactNode, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  className, 
  as: Component = 'span',
  children 
}) => {
  const { language, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text);
  
  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      if (!text || language === 'en') {
        if (isMounted) setTranslatedText(text);
        return;
      }
      
      try {
        const result = await translate(text);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Error translating text:', error);
        if (isMounted) {
          setTranslatedText(text); // Fallback to original text
        }
      }
    };
    
    translateText();
    
    return () => {
      isMounted = false;
    };
  }, [text, language, translate]);
  
  return (
    <Component className={className}>
      {translatedText}
      {children}
    </Component>
  );
};

export default TranslatedText;
