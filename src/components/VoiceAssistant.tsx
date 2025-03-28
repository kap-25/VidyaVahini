
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: any) => void;
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const userRole = user?.user_metadata?.role || 'student';
  
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        updateRecognitionLanguage();
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          
          if (handleTranslationCommand(transcript)) {
            return;
          }
          
          processVoiceCommand(transcript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error('Failed to recognize speech. Please try again.');
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      toast.error('Speech synthesis is not supported in your browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  useEffect(() => {
    updateRecognitionLanguage();
  }, [language]);
  
  const updateRecognitionLanguage = () => {
    if (!recognitionRef.current) return;
    
    const langMapping: {[key: string]: string} = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN'
    };
    
    recognitionRef.current.lang = langMapping[language] || 'en-US';
  };
  
  const handleTranslationCommand = (command: string): boolean => {
    const normalizedCommand = command.toLowerCase().trim();
    
    if (normalizedCommand.includes('translate to')) {
      const languageMatch = normalizedCommand.match(/translate to (\w+)/i);
      
      if (languageMatch && languageMatch[1]) {
        const requestedLang = languageMatch[1].toLowerCase();
        
        const languageNameToCode: {[key: string]: string} = {
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
          'french': 'fr',
          'chinese': 'zh',
          'arabic': 'ar',
          'russian': 'ru',
          'portuguese': 'pt',
          'german': 'de',
          'japanese': 'ja'
        };
        
        if (languageNameToCode[requestedLang]) {
          setLanguage(languageNameToCode[requestedLang]);
          speakResponse(`Translating to ${requestedLang}`);
          return true;
        }
      }
    }
    
    if (normalizedCommand.includes('हिंदी में अनुवाद') || 
        normalizedCommand.includes('हिंदी में बदलो')) {
      setLanguage('hi');
      speakResponse('हिंदी में अनुवाद हो रहा है');
      return true;
    }
    
    return false;
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
        setIsOpen(true);
        toast.info('Listening...');
      } catch (error) {
        console.error('Failed to start recognition', error);
        toast.error('Failed to start voice recognition.');
      }
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const processVoiceCommand = async (command: string) => {
    if (!command) return;
    setProcessingCommand(true);
    
    try {
      const currentPath = window.location.pathname;
      console.log('Processing voice command:', command, 'Current path:', currentPath);
      
      // Handle simple navigation commands directly (faster response)
      const lowerCommand = command.toLowerCase();
      
      // Direct dashboard tab navigation
      if (currentPath.includes('dashboard') && 
          /switch to|go to|open/.test(lowerCommand) && 
          /tab/.test(lowerCommand)) {
        
        const tabMatch = lowerCommand.match(/(?:switch|go|open) to (\w+) tab/i);
        if (tabMatch && tabMatch[1]) {
          const tabName = tabMatch[1].toLowerCase();
          console.log('Tab navigation detected:', tabName);
          
          if (typeof window.activateDashboardTab === 'function') {
            const success = window.activateDashboardTab(tabName);
            if (success) {
              speakResponse(`Switched to ${tabName} tab`);
              setProcessingCommand(false);
              return;
            }
          } else {
            // Store tab name for when dashboard loads
            sessionStorage.setItem('pendingDashboardTab', tabName);
          }
        }
      }
      
      // Direct page navigation
      if (/navigate to|go to|open/.test(lowerCommand)) {
        let targetPath = null;
        
        if (lowerCommand.includes('dashboard')) {
          targetPath = '/student-dashboard';
        } else if (lowerCommand.includes('courses') || lowerCommand.includes('my courses')) {
          targetPath = '/my-courses';
        } else if (lowerCommand.includes('profile')) {
          targetPath = '/profile';
        } else if (lowerCommand.includes('home')) {
          targetPath = '/student';
        }
        
        if (targetPath) {
          console.log('Direct navigation to:', targetPath);
          navigate(targetPath);
          speakResponse(`Navigating to ${targetPath.replace('/', '')}`);
          setProcessingCommand(false);
          return;
        }
      }
      
      // Send to AI for processing other commands
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: command }],
          userRole,
          isVoiceCommand: true,
          currentPath,
          language: language
        },
      });
      
      if (error) {
        console.error('Error invoking AI chat function:', error);
        throw error;
      }
      
      const aiResponse = data.response;
      console.log('AI response:', aiResponse);
      
      // Process response for navigation
      if (aiResponse.toLowerCase().includes('navigating to')) {
        const tabMatch = aiResponse.match(/switching to ([\w-]+) tab/i);
        if (tabMatch && tabMatch[1] && window.location.pathname.includes('dashboard')) {
          const tabName = tabMatch[1].toLowerCase();
          if (typeof window.activateDashboardTab === 'function') {
            const success = window.activateDashboardTab(tabName);
            if (!success) {
              speakResponse(`I couldn't find the ${tabName} tab.`);
              setProcessingCommand(false);
              return;
            }
          } else {
            sessionStorage.setItem('pendingDashboardTab', tabName);
          }
        }
        
        const navMatch = aiResponse.match(/navigating to ([^\.]+)/i);
        if (navMatch && navMatch[1]) {
          const pathMatch = navMatch[1].match(/(\/[\w-/]+)/);
          if (pathMatch && pathMatch[1]) {
            const path = pathMatch[1];
            navigate(path);
          } else {
            // Check for common navigation terms
            const destination = navMatch[1].toLowerCase().trim();
            
            if (destination.includes('dashboard')) {
              navigate('/student-dashboard');
            } else if (destination.includes('course')) {
              navigate('/my-courses');
            } else if (destination.includes('profile')) {
              navigate('/profile');
            } else if (destination.includes('home')) {
              navigate('/student');
            }
          }
        }
      }
      
      speakResponse(aiResponse);
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakResponse('Sorry, I encountered an error processing your command.');
    } finally {
      setProcessingCommand(false);
    }
  };
  
  const speakResponse = (text: string) => {
    if (!synthRef.current || !audioEnabled) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMapping: {[key: string]: string} = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN'
    };
    
    utterance.lang = langMapping[language] || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  };
  
  const closeAssistant = () => {
    setIsOpen(false);
    if (isListening) {
      stopListening();
    }
  };
  
  return (
    <>
      <div className="fixed bottom-32 right-8 z-50">
        <Button 
          onClick={toggleListening}
          className={`rounded-full h-14 w-14 shadow-lg transition-all duration-300 ${
            isListening 
              ? "bg-sky-400 hover:bg-sky-500 scale-110" 
              : "bg-sky-400 hover:bg-sky-500"
          }`}
          size="icon"
        >
          <Mic className={`h-6 w-6 text-white ${isListening ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-black/80 backdrop-blur-md border-none p-8 rounded-2xl max-w-sm">
          <AlertDialogTitle className="sr-only">Voice Assistant</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Use voice commands to navigate and control the application
          </AlertDialogDescription>
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? "bg-gradient-to-r from-sky-400 to-sky-300 animate-pulse" 
                : processingCommand 
                ? "bg-gradient-to-r from-indigo-400 to-purple-300"
                : "bg-gradient-to-r from-sky-400 to-sky-300"
            }`}>
              {isListening ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="w-4 h-4 bg-white rounded-full animate-ping absolute"></span>
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                </div>
              ) : processingCommand ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin"></span>
                </div>
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </div>
            
            <div className="text-white text-center">
              {isListening 
                ? 'Listening...' 
                : processingCommand
                ? 'Processing command...'
                : isSpeaking 
                ? 'Speaking...' 
                : 'How can I help you?'}
            </div>
            
            {transcript && (
              <div className="text-white/90 text-sm bg-black/30 p-2 rounded-md max-w-full break-words">
                "{transcript}"
              </div>
            )}
            
            <div className="text-white/70 text-sm text-center">
              {isListening ? (
                language === 'hi' 
                  ? 'हिंदी में बोलें या "translate to English" कहें'
                  : 'Say "translate to Hindi" to change language'
              ) : (
                language === 'hi'
                  ? 'माइक पर टैप करके बोलना शुरू करें'
                  : 'Tap the mic to start speaking'
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Button 
                onClick={toggleListening}
                className="rounded-full bg-gray-800 hover:bg-gray-700 h-12 w-12"
                size="icon"
              >
                <Mic className="h-5 w-5 text-white" />
              </Button>
              
              <Button 
                onClick={closeAssistant}
                className="rounded-full bg-gray-800 hover:bg-gray-700 h-12 w-12"
                size="icon"
              >
                <X className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VoiceAssistant;
