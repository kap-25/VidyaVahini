
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Book, Send, User, Bot, Mic, Image as ImageIcon, 
  Loader, Languages, ThumbsUp, ThumbsDown, X, PanelRight
} from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  originalContent?: string;
  id?: string;
  feedback?: number;
}

const EducationalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your educational AI tutor. I can help you learn new subjects, explain difficult concepts, solve problems, and answer questions. You can type, speak, or upload images of problems. What would you like to learn about today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSidebar, setShowSidebar] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { translate, language, setLanguage } = useLanguage();
  const { translateWithVoice } = useVoiceTranslation();
  const isMobile = useIsMobile();

  const userRole = user?.user_metadata?.role || 'student';

  // Suggested topics based on user role
  const suggestedTopics = [
    "Explain the theory of relativity",
    "Help me solve quadratic equations",
    "What is photosynthesis?",
    "How do I analyze a literary text?",
    "Explain machine learning algorithms",
    "Help with biology homework"
  ];

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

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

  const fetchChatHistory = async () => {
    if (!user) return;
    
    try {
      setIsFetchingHistory(true);
      
      const { data, error } = await supabase.rpc('get_recent_conversations', {
        p_user_id: user.id,
        p_limit: 5
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const historyMessages: Message[] = [];
        
        historyMessages.push(messages[0]);
        
        data.forEach(item => {
          historyMessages.push({
            role: 'user',
            content: item.message,
            id: item.id
          });
          
          historyMessages.push({
            role: 'assistant',
            content: item.response,
            id: item.id,
            feedback: item.feedback
          });
        });
        
        setMessages(historyMessages);
        toast.success('Loaded your recent conversations');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsFetchingHistory(false);
    }
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
      
      if (data.languageToSet && data.languageToSet !== language) {
        setLanguage(data.languageToSet);
        toast.success(`Changed language to ${data.languageToSet}`);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (user) {
        const { error: saveError } = await supabase
          .from('ai_chat_conversations')
          .insert({
            user_id: user.id,
            message: userMessage.content,
            response: data.response,
            subject: getCurrentSubject(messages),
            metadata: {
              hasImage: !!userMessage.imageUrl,
              language: language,
              imageUrl: userMessage.imageUrl || null
            }
          });
          
        if (saveError) {
          console.error('Error saving conversation:', saveError);
        }
      }
      
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
  
  const saveFeedback = async (messageId: string | undefined, feedback: number) => {
    if (!user || !messageId) return;
    
    try {
      const { error } = await supabase
        .from('ai_chat_conversations')
        .update({ feedback })
        .eq('id', messageId);
        
      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );
      
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback');
    }
  };
  
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
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
      
      await supabase.storage.getBucket('images').catch(() => {
        return supabase.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 5242880
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
      
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      setPendingImageUrl(urlData.publicUrl);
      toast.success('Image uploaded successfully! Now you can send the message to analyze it.');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      
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

  const translateMessage = async (message: Message, targetLanguage: string) => {
    if (isTranslating) return;
    
    try {
      setIsTranslating(true);
      
      const originalContent = message.originalContent || message.content;
      
      if (targetLanguage === 'en' && message.originalContent) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg === message 
              ? { ...msg, content: originalContent, originalContent: undefined } 
              : msg
          )
        );
        return;
      }
      
      setLanguage(targetLanguage);
      
      const translatedContent = await translate(originalContent);
      
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

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic);
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: 'Hello! I\'m your educational AI tutor. I can help you learn new subjects, explain difficult concepts, solve problems, and answer questions. You can type, speak, or upload images of problems. What would you like to learn about today?' 
    }]);
    toast.success('Chat cleared');
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={cn(
        "flex items-start gap-3 mb-5 group",
        isUser ? "flex-row-reverse" : ""
      )}>
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          isUser ? "bg-edu-purple" : "bg-gray-700"
        )}>
          {isUser ? (
            <span className="text-white text-sm font-medium">You</span>
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>
        
        <div className={cn(
          "max-w-[85%] p-4 rounded-lg break-words relative shadow-sm",
          isUser 
            ? "bg-edu-purple text-white rounded-tr-none" 
            : "bg-gray-700 text-white rounded-tl-none"
        )}>
          <div className="prose prose-invert prose-sm max-w-none">
            {message.content}
          </div>
          
          {message.imageUrl && (
            <div className="mt-3">
              <img 
                src={message.imageUrl} 
                alt="User uploaded" 
                className="rounded-md max-h-60 object-contain"
              />
            </div>
          )}
          
          {message.role === 'assistant' && message.id && (
            <div className="mt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full p-1 ${message.feedback === 1 ? 'bg-green-800 text-white' : 'text-green-400'}`}
                onClick={() => saveFeedback(message.id, 1)}
                title="Helpful response"
              >
                <ThumbsUp size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full p-1 ${message.feedback === -1 ? 'bg-red-800 text-white' : 'text-red-400'}`}
                onClick={() => saveFeedback(message.id, -1)}
                title="Not helpful response"
              >
                <ThumbsDown size={14} />
              </Button>
            </div>
          )}
          
          {message.role === 'assistant' && (
            <div className="absolute -bottom-2 right-2 transform translate-y-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
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
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screenbg-edu-dark text-white relative">
      
      <div className="pb-16 pt-0">
        <div className="max-w-full mx-auto px-0 flex flex-col md:flex-row gap-2">
          {/* Main Chat Area */}
          <div className="w-full md:flex-1 flex flex-col h-[calc(108vh-10rem)]">
            <PageTranslationHeader>
              <div className="flex items-center mb-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-gray-800"
                >
                  <ArrowLeft size={24} />
                </Button>
                <h1 className="text-lg font-semibold flex items-center">
                  <Book className="mr-2 text-edu-purple" />
                  <T>Educational AI Tutor</T>
                </h1>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="md:hidden text-white justify-end hover:bg-gray-800"
                >
                  <PanelRight size={20} />
                </Button>
              </div>
            </PageTranslationHeader>

            {pendingImageUrl && (
              <div className="mb-4 relative bg-gray-800 p-2 rounded-lg">
                <img 
                  src={pendingImageUrl} 
                  alt="Uploaded problem" 
                  className="rounded-lg w-full max-h-60 object-contain"
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="absolute top-3 right-3 h-8 w-8" 
                  onClick={() => setPendingImageUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex-1 relative">
              <div 
                ref={chatContainerRef}
                className="absolute inset-0 flex flex-col rounded-xl overflow-hidden"
              >
                {/* Messages Container */}
                <ScrollArea className="flex-1 px-2 py-4 bg-gray-800/50 backdrop-blur-sm rounded-t-xl">
                  {isFetchingHistory ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader className="h-8 w-8 text-edu-purple animate-spin mr-2" />
                      <span className="text-edu-purple">Loading conversation history...</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-16 min-h-full">
                        {messages.map((message, i) => (
                          <MessageBubble key={i} message={message} />
                        ))}
                        
                        {isLoading && (
                          <div className="flex items-start gap-3 mb-5">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
                              <Bot size={18} className="text-white" />
                            </div>
                            <div className="max-w-[85%] rounded-lg bg-gray-700 text-white rounded-tl-none">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </>
                  )}
                </ScrollArea>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />

                {/* Chat Input Area */}
                <form 
                  onSubmit={handleSubmit} 
                  className="bg-gray-900 border-t border-gray-700 p-3 rounded-b-xl"
                >
                  <div className="relative mr-6">
                    <Textarea 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      placeholder="Ask me about any subject..." 
                      className="min-h-[40px] max-h-[200px] mb-3 w-full bg-gray-800 text-white border-gray-700 focus:border-edu-purple resize-none rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      disabled={isLoading} 
                    />
                    <div className="relative w-full flex flex-row gap-2">
                      <Button
                        type="button"
                        onClick={triggerImageUpload}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full"
                        disabled={isLoading || isUploading}
                        size="icon"
                        title="Upload an image"
                      >
                        {isUploading ? 
                          <Loader className="h-5 w-5 animate-spin" /> : 
                          <ImageIcon className="h-5 w-5" />
                        }
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
                        className="bg-edu-purple hover:bg-edu-purple-dark text-white rounded-full"
                        disabled={isLoading || (!input.trim() && !pendingImageUrl)}
                        title="Send message"
                      >
                        <Send className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">Send</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar - Help & Suggestions */}
          <div className={cn(
            "bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 space-y-4 overflow-auto transition-all duration-200",
            isMobile 
              ? showSidebar
                ? "fixed inset-0 z-50 m-4" 
                : "hidden" 
              : "w-80 h-[calc(100vh-9rem)]"
          )}>
            {isMobile && showSidebar && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Helpful Resources</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                >
                  <X size={20} />
                </Button>
              </div>
            )}

            <Tabs defaultValue="topics" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Try asking about:</h4>
                  <div className="grid gap-2">
                    {suggestedTopics.map((topic, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start bg-gray-700 hover:bg-gray-600 text-left h-auto py-2"
                        onClick={() => handleSuggestedTopic(topic)}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="help" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ImageIcon size={16} className="mt-1 text-edu-purple" />
                      <span>Upload images of problems to get help</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Mic size={16} className="mt-1 text-edu-purple" />
                      <span>Use voice commands to ask questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Languages size={16} className="mt-1 text-edu-purple" />
                      <span>Translate responses to different languages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ThumbsUp size={16} className="mt-1 text-edu-purple" />
                      <span>Provide feedback on responses</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Actions:</h4>
                  <Button
                    variant="outline"
                    className="w-full mb-2 bg-red-900/30 hover:bg-red-800/50"
                    onClick={clearChat}
                  >
                    Clear Chat
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EducationalChatbot;
