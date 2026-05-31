import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, MessageSquare, Send, X, User } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! I am your AI Finance Assistant. You can ask me details about your budget, spending trends, goals, and forecasts!' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg = textToSend;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please verify your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Where am I overspending?",
    "How much did I spend this month?",
    "What is my predicted expense for next month?",
    "What is my financial health score?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-650 text-white shadow-2xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-pink-400/25 animate-glow"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-card rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-pink-100 bg-white transition-all duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-pink-50/40 border-b border-pink-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-200 text-pink-600">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 block">AI Finance Helper</span>
                <span className="text-xs text-emerald-600 flex items-center font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-pink-600 focus:outline-none p-1 bg-white border border-slate-100 hover:border-pink-200 rounded-lg shadow-sm transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/10">
            {messages.map((m, index) => (
              <div key={index} className={`flex items-start ${m.sender === 'user' ? 'justify-end' : ''}`}>
                {m.sender === 'bot' && (
                  <div className="h-7.5 w-7.5 rounded-full bg-pink-150/10 border border-pink-200 text-pink-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed shadow-sm font-semibold ${
                    m.sender === 'user' 
                      ? 'bg-pink-400 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-pink-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="h-7.5 w-7.5 rounded-full bg-pink-150/10 border border-pink-200 text-pink-600 flex items-center justify-center flex-shrink-0 mr-2 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-white border border-pink-100 rounded-2xl rounded-tl-none flex space-x-1.5 items-center justify-center h-8 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2.5 border-t border-pink-50 bg-pink-50/10 flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="text-xs text-pink-700 hover:text-pink-800 bg-white hover:bg-pink-50/50 border border-pink-200 px-2.5 py-1 rounded-lg transition-all font-bold shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="p-3 bg-white border-t border-pink-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 text-slate-700 font-semibold shadow-sm"
            />
            <button
              type="submit"
              className="p-2.5 bg-pink-400 hover:bg-pink-550 text-white rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95"
            >
              <Send className="h-3.5 w-3.5 fill-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
