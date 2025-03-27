
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, ArrowUp, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage],
          userRole
        }
      });
      if (error) throw error;

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response. Please try again.');

      // Add a fallback response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an issue. For students, you can explore courses, check your dashboard, or view your profile. For educators, you can manage your courses, view analytics, or update your profile.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {/* Chat button - fixed position adjusted for mobile */}
      <button 
        onClick={() => setIsOpen(true)} 
        aria-label="Open AI Chat" 
        className="fixed bottom-20 right-4 z-50 bg-edu-purple text-white rounded-full p-3 shadow-lg hover:bg-edu-purple-dark transition-colors"
      >
        <Sparkles size={isMobile ? 20 : 24} />
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-edu-dark border border-edu-purple rounded-xl w-full max-w-md h-[80vh] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-edu-purple">
              <div className="flex items-center">
                <Bot className="h-5 w-5 md:h-6 md:w-6 text-edu-purple mr-2" />
                <h3 className="font-semibold text-sm md:text-base text-white">AI Navigation Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {messages.map((message, i) => (
                <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm md:text-base ${message.role === 'user' ? 'bg-edu-purple text-white' : 'bg-gray-700 text-white'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-gray-700 text-white">
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

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-gray-700">
              <div className="relative">
                <Textarea 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Ask me anything about the platform..." 
                  className="min-h-[50px] text-sm md:text-base w-full bg-gray-800 text-white border-gray-700 focus:border-edu-purple resize-none pr-10" 
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
                  className="absolute right-2 bottom-2 p-1 bg-transparent hover:bg-gray-700 text-edu-purple" 
                  disabled={isLoading || !input.trim()} 
                  size="icon"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChatBox;
