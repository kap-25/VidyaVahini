
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Send, User, Bot, Mic, Image as ImageIcon, Loader, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import T from '@/components/T';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';
import PageTranslationHeader from '@/components/PageTranslationHeader';
import { useVoiceTranslation } from '@/hooks/useVoiceTranslation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  originalContent?: string; // To store the original content before translation
}

const EducationalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your educational AI assistant. I can help you learn new subjects, explain difficult concepts, solve problems, and answer questions. You can type, speak, or upload images of problems. What would you like to learn about today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { translate, language, setLanguage } = useLanguage();
  const { translateWithVoice } = useVoiceTranslation();

  const userRole = user?.user_metadata?.role || 'student';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        // Set language based on currently selected language
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
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          
          // Auto-submit if it looks like a command
          if (transcript.toLowerCase().includes('translate') || 
              transcript.toLowerCase().includes('solve') ||
              transcript.toLowerCase().includes('explain') ||
              transcript.toLowerCase().includes('what is') ||
              transcript.toLowerCase().includes('how to')) {
            setTimeout(() => {
              handleSubmit(new Event('submit') as any);
            }, 500);
          }
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
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !pendingImageUrl) return;

    const userMessage: Message = { 
      role: 'user' as const, 
      content: input.trim() || "Can you help me with this problem?",
      ...(pendingImageUrl && { imageUrl: pendingImageUrl })
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setPendingImageUrl('');
    setIsLoading(true);

    try {
      let prompt = input.trim();
      if (userMessage.imageUrl) {
        prompt = `${prompt || "Can you help me with this problem?"} [Image attached]`;
      }

      console.log("Sending message to AI chat function:", prompt);
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage],
          userRole,
          isEducational: true,
          currentSubject: getCurrentSubject(messages),
          hasImage: !!userMessage.imageUrl,
          isVoiceCommand: false,
          currentPath: window.location.pathname,
          language: language
        },
      });

      if (error) throw error;
      
      console.log("AI response:", data);
      
      // Process any direct commands in the response
      if (data.languageToSet && data.languageToSet !== language) {
        setLanguage(data.languageToSet);
        toast.success(`Changed language to ${data.languageToSet}`);
      }
      
      // Add the assistant's response
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      
      // Speak the response if it came from voice input
      if (isListening) {
        speakResponse(data.response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an issue analyzing your question. Please try again or try a different question.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    
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
    
    window.speechSynthesis.speak(utterance);
  };

  const getCurrentSubject = (msgs: Message[]): string => {
    const recentMessages = msgs.slice(-3).map(m => m.content.toLowerCase());
    const subjects = {
      math: ['math', 'mathematics', 'algebra', 'calculus', 'equation', 'geometry', 'statistics'],
      science: ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'geology'],
      history: ['history', 'civilization', 'war', 'empire', 'revolution', 'dynasty', 'century'],
      literature: ['literature', 'book', 'author', 'novel', 'poem', 'writing', 'shakespeare'],
      programming: ['programming', 'code', 'javascript', 'python', 'algorithm', 'function'],
      language: ['language', 'grammar', 'vocabulary', 'speaking', 'writing', 'spanish', 'french', 'english']
    };

    for (const [subject, keywords] of Object.entries(subjects)) {
      if (keywords.some(keyword => recentMessages.some(msg => msg.includes(keyword)))) {
        return subject;
      }
    }
    
    return 'general';
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
        // Update language setting based on current language
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
        
        if (recognitionRef.current) {
          recognitionRef.current.lang = langMapping[language] || 'en-US';
        }
        
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recognition', error);
        toast.error('Failed to start voice recognition');
      }
    } else {
      toast.error('Speech recognition is not supported in your browser');
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const [pendingImageUrl, setPendingImageUrl] = useState<string>('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please upload an image smaller than 5MB.');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const userFolder = user?.id || 'anonymous';
      const filePath = `${userFolder}/${fileName}`;
      
      console.log('Uploading file to storage bucket:', 'images');
      
      // Make sure storage bucket exists first
      await supabase.storage.getBucket('images').catch(() => {
        console.log('Creating bucket...');
        return supabase.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      });
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }
      
      console.log('Upload successful:', data);
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      console.log('File public URL:', urlData.publicUrl);
      
      setPendingImageUrl(urlData.publicUrl);
      toast.success('Image uploaded successfully! Now you can send the message to analyze it.');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      // More detailed error message with specific handling for common errors
      if (error.message && error.message.includes('row-level security')) {
        toast.error('Permission denied: Unable to upload image due to security restrictions');
      } else if (error.message && error.message.includes('not found')) {
        toast.error('Storage bucket not found. Please try again later.');
      } else {
        toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Translation functionality
  const translateMessage = async (message: Message, targetLanguage: string) => {
    if (isTranslating) return;
    
    try {
      setIsTranslating(true);
      
      // Save original content if not already saved
      const originalContent = message.originalContent || message.content;
      
      // If we're translating back to English and we have the original content
      if (targetLanguage === 'en' && message.originalContent) {
        // Update the message with the original content
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg === message 
              ? { ...msg, content: originalContent, originalContent: undefined } 
              : msg
          )
        );
        return;
      }
      
      // Set the language for the useLanguage hook
      setLanguage(targetLanguage);
      
      // Get translation
      const translatedContent = await translate(originalContent);
      
      // Update the message with the translated content
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg === message 
            ? { ...msg, content: translatedContent, originalContent: originalContent } 
            : msg
        )
      );
      
      toast.success(`Translated to ${targetLanguage === 'hi' ? 'Hindi' : 'Marathi'}`);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate message. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-edu-dark text-white pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <PageTranslationHeader>
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-xl font-semibold flex items-center">
              <Book className="mr-2 text-edu-purple" />
              <T>Educational AI Chatbot</T>
            </h1>
            <div className="w-8"></div>
          </div>
        </PageTranslationHeader>

        {pendingImageUrl && (
          <div className="mb-4 relative">
            <img 
              src={pendingImageUrl} 
              alt="Uploaded problem" 
              className="rounded-lg w-full max-h-60 object-contain bg-gray-800"
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2" 
              onClick={() => setPendingImageUrl('')}
            >
              ✕
            </Button>
          </div>
        )}

        <div className="bg-edu-card-bg rounded-xl p-4 mb-4 overflow-y-auto h-[calc(100vh-280px)]">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex items-start max-w-[80%] gap-2">
                  {message.role === 'assistant' && (
                    <div className="bg-edu-purple rounded-full p-1.5">
                      <Bot size={18} className="text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg px-4 py-2 relative ${
                      message.role === 'user'
                        ? 'bg-edu-purple text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {message.content}
                    {message.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={message.imageUrl} 
                          alt="User uploaded" 
                          className="rounded-md max-h-40 object-contain"
                        />
                      </div>
                    )}
                    
                    {/* Add Translation button for AI responses only */}
                    {message.role === 'assistant' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute -bottom-4 right-2 bg-edu-purple text-white hover:bg-edu-purple-dark"
                            disabled={isTranslating}
                          >
                            <Languages size={14} className="mr-1" />
                            {isTranslating ? 'Translating...' : 'Translate'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => translateMessage(message, 'hi')}>
                            Hindi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => translateMessage(message, 'mr')}>
                            Marathi
                          </DropdownMenuItem>
                          {message.originalContent && (
                            <DropdownMenuItem onClick={() => translateMessage(message, 'en')}>
                              English (Original)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="bg-gray-600 rounded-full p-1.5">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%] gap-2">
                  <div className="bg-edu-purple rounded-full p-1.5">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-700 text-white">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />

        <form onSubmit={handleSubmit} className="bg-edu-card-bg rounded-xl p-2 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about any subject..."
            className="min-h-[50px] w-full bg-gray-800 text-white border-gray-700 focus:border-edu-purple resize-none pr-36 rounded-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <div className="absolute right-4 bottom-4 flex gap-2">
            <Button
              type="button"
              onClick={triggerImageUpload}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full"
              disabled={isLoading || isUploading}
              size="icon"
              title="Upload an image"
            >
              {isUploading ? <Loader className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              onClick={toggleListening}
              className={`p-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full`}
              disabled={isLoading}
              size="icon"
              title={isListening ? "Stop listening" : "Speak your question"}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="submit"
              className="p-2 bg-edu-purple hover:bg-edu-purple-dark text-white rounded-full"
              disabled={isLoading || (!input.trim() && !pendingImageUrl)}
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EducationalChatbot;
