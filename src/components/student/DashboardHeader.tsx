
import React from 'react';
import Header from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { T } from '@/components/T';
import TranslateButton from '@/components/TranslateButton';

interface DashboardHeaderProps {
  title: string;
  description: string;
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, className }) => {
  const { translated: translatedTitle } = useTranslation(title);
  const { translated: translatedDescription } = useTranslation(description);
  
  return (
    <>
      <Header />
      
      {/* Dashboard Title with Language Switcher */}
      <div className={`bg-gradient-to-r from-edu-purple-dark to-edu-purple rounded-xl p-5 mb-8 ${className || ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">{translatedTitle}</h1>
          <div className="flex space-x-2">
            <TranslateButton variant="ghost" size="sm" />
          </div>
        </div>
        <p className="text-white/80">{translatedDescription}</p>
        <p className="text-white/60 text-xs mt-2">
          <T>Tip: Say "translate to Hindi" to change language with your voice</T>
        </p>
      </div>
    </>
  );
};

export default DashboardHeader;
