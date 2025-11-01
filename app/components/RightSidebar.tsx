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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && jobId) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! Ask me about your financial data.\n\nTry:\n• What's the total amount?\n• Show all taxes\n• What's on page 1?",
        timestamp: new Date(),
      }]);
    }
  }, [jobId, messages.length]);

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
    <div className="w-80 h-screen bg-white border-l border-zinc-200 shrink-0 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-zinc-200 flex items-center px-4">
        <MessageSquare className="w-5 h-5 text-zinc-700 shrink-0" />
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900">
            Ask Questions
          </h3>
          {jobId && (
            <p className="text-xs text-zinc-500 truncate">
              Job: {jobId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!jobId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Upload a document to start asking questions</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
    </div>
  );
}

