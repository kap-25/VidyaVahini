
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, languages } from '@/context/LanguageContext';

interface TranslateButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  variant = 'ghost',
  size = 'icon',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  
  const handleLanguageChange = (langCode: string) => {
    if (langCode === language) return;
    
    setLanguage(langCode);
    console.log(`Language changed to ${langCode}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`relative ${className}`}
        >
          <Globe className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">Translate</span>}
          <span className="absolute -top-1 -right-1 bg-edu-purple text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {language.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-edu-card-bg border-gray-700 max-h-[300px] overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`cursor-pointer ${language === lang.code ? 'bg-edu-purple/20 text-edu-purple' : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TranslateButton;
