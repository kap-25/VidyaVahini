
import React, { useState } from 'react';
import { useLanguage, languages } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

interface FullLanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const FullLanguageSwitcher: React.FC<FullLanguageSwitcherProps> = ({ 
  variant = 'default', 
  size = 'default',
  className = '' 
}) => {
  const { language, setLanguage, isLoading } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const handleLanguageChange = (langCode: string) => {
    if (langCode === language) return;
    
    setLanguage(langCode);
    setOpen(false);
    
    // Get language name for the toast
    const langName = languages.find(l => l.code === langCode)?.name || langCode;
    toast.success(`Language changed to ${langName}`);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`relative ${className}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">Translating...</span>
          ) : size === 'icon' ? (
            <>
              <Globe className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-edu-purple text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {language.toUpperCase()}
              </span>
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Translate
              <span className="ml-1 bg-edu-purple text-white text-[10px] rounded-full px-1.5 py-0.5">
                {language.toUpperCase()}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-edu-card-bg border-gray-700">
        <div className="py-1 max-h-[300px] overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              className={`cursor-pointer ${language === lang.code ? 'bg-edu-purple/20 text-edu-purple' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FullLanguageSwitcher;
