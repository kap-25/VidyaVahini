
import React from 'react';
import FullLanguageSwitcher from './FullLanguageSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageTranslationHeaderProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * A reusable component that displays page title with a translation button
 * Can be used across different pages for consistent layout
 */
const PageTranslationHeader: React.FC<PageTranslationHeaderProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-wrap justify-between items-center mb-4 ${className}`}>
      <div className={`${isMobile ? 'w-full mb-2' : 'flex-1'}`}>
        {title && <h1 className="text-xl md:text-2xl font-bold">{title}</h1>}
        {children}
      </div>
      <FullLanguageSwitcher variant="ghost" size={isMobile ? "sm" : "icon"} />
    </div>
  );
};

export default PageTranslationHeader;
