
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, ArrowUp, X, Sparkles, Send, PanelRightClose, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

const AiChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hi there! I can help you navigate the platform. What would you like to do?'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role || 'student';
  const isMobile = useIsMobile();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && user) {
      fetchChatHistory();
    }
  }, [isOpen, user]);
  
  const fetchChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_recent_conversations', {
        p_user_id: user.id,
        p_limit: 3
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
            id: item.id
          });
        });
        
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage],
          userRole
        }
      });
      
      if (error) throw error;

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (user) {
        const { error: saveError } = await supabase
          .from('ai_chat_conversations')
          .insert({
            user_id: user.id,
            message: userMessage.content,
            response: data.response,
            subject: 'navigation',
            metadata: { isNavigationChat: true }
          });
          
        if (saveError) {
          console.error('Error saving conversation:', saveError);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an issue. For students, you can explore courses, check your dashboard, or view your profile. For educators, you can manage your courses, view analytics, or update your profile.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={cn(
        "flex items-start gap-2 mb-3",
        isUser ? "flex-row-reverse" : ""
      )}>
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-edu-purple" : "bg-gray-700"
        )}>
          {isUser ? (
            <span className="text-white text-sm font-medium">You</span>
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>
        
        <div className={cn(
          "max-w-[85%] p-3 rounded-lg break-words",
          isUser ? "bg-edu-purple text-white rounded-tr-none" : "bg-gray-700 text-white rounded-tl-none"
        )}>
          {message.content}
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(true)} 
        aria-label="Open AI Chat" 
        className="fixed bottom-52 right-4 z-50 bg-edu-purple text-white rounded-full p-3 shadow-lg hover:bg-edu-purple-dark transition-colors"
      >
        <Sparkles size={isMobile ? 20 : 24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-edu-dark border border-edu-purple rounded-xl w-full max-w-md h-[80vh] max-h-[600px] flex flex-col overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-edu-purple bg-edu-card-bg">
              <div className="flex items-center">
                <Bot className="h-5 w-5 text-edu-purple mr-2" />
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1">
                {messages.map((message, i) => (
                  <MessageBubble key={i} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="max-w-[85%] p-3 rounded-lg bg-gray-700 text-white rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-edu-card-bg">
              <div className="relative flex items-center">
                <Textarea 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Ask me anything about the platform..." 
                  className="min-h-[44px] max-h-[120px] text-sm w-full bg-gray-800 text-white border-gray-700 focus:border-edu-purple resize-none pr-10 py-2" 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }} 
                  disabled={isLoading} 
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 p-1 bg-transparent hover:bg-gray-700 text-edu-purple" 
                  disabled={isLoading || !input.trim()} 
                  size="icon"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatBox;
