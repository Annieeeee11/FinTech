'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RightSidebarProps {
  jobId: string | null;
  onClose?: () => void;
}

export default function RightSidebar({ jobId }: RightSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message when expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0 && jobId) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! Ask me about your financial data.\n\nTry:\n• What's the total amount?\n• Show all taxes\n• What's on page 1?",
        timestamp: new Date(),
      }]);
    }
  }, [isExpanded, jobId, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !jobId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          question: userMessage.content,
          conversationHistory: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={`fixed right-0 top-0 h-screen bg-white border-l border-zinc-200 transition-all duration-300 ease-in-out z-40 flex flex-col ${
          isExpanded ? 'w-96' : 'w-14'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className="h-16 border-b border-zinc-200 flex items-center px-4">
          <MessageSquare className="w-5 h-5 text-zinc-700 flex-shrink-0" />
          <div
            className={`ml-3 transition-all duration-300 ${
              isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            } overflow-hidden`}
          >
            <h3 className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
              Ask Questions
            </h3>
            {jobId && (
              <p className="text-xs text-zinc-500 whitespace-nowrap">
                Job: {jobId.substring(0, 8)}...
              </p>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {!jobId ? (
            <div
              className={`flex items-center justify-center h-full transition-all duration-300 ${
                isExpanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-center text-zinc-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Upload a document to start asking questions</p>
              </div>
            </div>
          ) : (
            <div
              className={`space-y-4 transition-all duration-300 ${
                isExpanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {isExpanded && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={jobId ? "Ask about your data..." : "Upload document first"}
                disabled={!jobId || isLoading}
                className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!jobId || !input.trim() || isLoading}
                className="px-3 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Collapsed Icon Indicator */}
        {!isExpanded && messages.length > 1 && (
          <div className="absolute top-20 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Spacer */}
      <div className="w-14" />
    </>
  );
}

