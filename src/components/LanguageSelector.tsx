
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage, languages } from '@/context/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setOpen(false);
    
    // Log language change but don't show toast
    console.log(`Language changed to ${langCode}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`text-white hover:text-edu-purple relative ${className || ''}`}
          aria-label="Change language"
        >
          <Globe size={20} />
          <span className="absolute -top-1 -right-1 bg-edu-purple text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {language.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-edu-card-bg border-gray-700 p-0">
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-edu-dark/50 ${
                language === lang.code ? 'bg-edu-purple/20 text-edu-purple' : ''
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSelector;
