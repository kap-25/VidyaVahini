
import React, { ReactNode, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TranslationWrapperProps {
  children: ReactNode;
}

const TranslationWrapper: React.FC<TranslationWrapperProps> = ({ children }) => {
  const { language } = useLanguage();
  
  // Update document lang attribute when language changes
  useEffect(() => {
    console.log('Language changed to:', language);
    document.documentElement.lang = language;
    
    // Additional localization setup for RTL languages
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
  }, [language]);
  
  return (
    <div className="translation-wrapper" data-language={language}>
      {children}
    </div>
  );
};

export default TranslationWrapper;
