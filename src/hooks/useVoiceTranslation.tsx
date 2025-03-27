
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

/**
 * A custom hook that combines voice commands with translation functionality
 * Provides methods to handle voice commands for translation
 */
export function useVoiceTranslation() {
  const { language, setLanguage, translate } = useLanguage();
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);

  useEffect(() => {
    // Set up a global function to handle translation voice commands
    window.handleTranslateVoiceCommand = (command: string) => {
      const lowerCommand = command.toLowerCase();
      
      // Check if this is a translation command
      if (lowerCommand.includes('translate to')) {
        const langMatch = lowerCommand.match(/translate to (\w+)/i);
        if (langMatch && langMatch[1]) {
          const targetLang = mapSpokenLanguageToCode(langMatch[1].toLowerCase());
          if (targetLang) {
            setLanguage(targetLang);
            setLastVoiceCommand(`Translating to ${langMatch[1]}`);
            return true;
          }
        }
      }
      
      // Hindi translation commands
      if (lowerCommand.includes('हिंदी में अनुवाद') || 
          lowerCommand.includes('हिंदी में बदलो')) {
        setLanguage('hi');
        setLastVoiceCommand('हिंदी में अनुवाद हो रहा है');
        return true;
      }
      
      return false;
    };
    
    return () => {
      // Clean up
      delete window.handleTranslateVoiceCommand;
    };
  }, [setLanguage]);
  
  // Helper function to map spoken language names to language codes
  const mapSpokenLanguageToCode = (spokenLanguage: string): string | null => {
    const languageMap: Record<string, string> = {
      'english': 'en',
      'hindi': 'hi',
      'bengali': 'bn',
      'tamil': 'ta',
      'telugu': 'te',
      'kannada': 'kn',
      'malayalam': 'ml',
      'marathi': 'mr',
      'gujarati': 'gu',
      'punjabi': 'pa',
      'spanish': 'es',
      'french': 'fr'
    };
    
    return languageMap[spokenLanguage] || null;
  };
  
  // Translate text with voice feedback option
  const translateWithVoice = async (text: string, speakResult: boolean = false) => {
    if (!text || language === 'en') return text;
    
    try {
      const result = await translate(text);
      
      if (speakResult && 'speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(result);
        speech.lang = language;
        window.speechSynthesis.speak(speech);
      }
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };
  
  return {
    language,
    setLanguage,
    translateWithVoice,
    lastVoiceCommand
  };
}

export default useVoiceTranslation;
