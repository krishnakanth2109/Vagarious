<<<<<<< HEAD

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'bot';
    content: string;
}

export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: "Hi there! 👋 I'm V-Bot. I can provide you with information on Vagarious Solutions services and recruitment. How can I assist you today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Backend is likely on port 5000 based on allowedOrigins
            const res = await axios.post('http://localhost:5000/api/chat', { message: userMsg });

            setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to the server. Please ensure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] md:w-[380px] h-[550px] bg-white dark:bg-zinc-900 border rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">V-Bot</div>
                                    <div className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </Button>
                        </div>

                        {/* Messages Area - Light Gray Background */}
                        <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-zinc-950">
                            <div className="space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-zinc-800 border text-foreground rounded-tl-none'
                                            }`}>
                                            <div className={`markdown-preview prose text-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'dark:text-gray-100 text-gray-800'}`}>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-zinc-800 border shadow-sm p-4 rounded-2xl rounded-tl-none text-sm flex gap-2 items-center">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t shrink-0">
                            <div className="relative">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your question..."
                                    className="pr-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus-visible:ring-blue-600"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-2 top-2 h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    onClick={handleSend}
                                    disabled={isLoading}
                                >
                                    <Send size={16} />
                                </Button>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                <span className="text-[10px] text-muted-foreground">Powered by Vagarious AI</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`!h-14 !w-14 !rounded-full pointer-events-auto flex items-center justify-center border-none outline-none ring-0 shadow-lg shadow-blue-500/40 transition-all duration-300 ${isOpen ? 'bg-destructive rotate-90 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                style={{ borderRadius: '9999px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X className="h-9 w-9" /> : <MessageCircle className="h-9 w-9" />}
            </motion.button>
        </div>
    );
};
=======
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hello! I am the Vagarious Solutions AI Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput(""); // Clear input immediately

    // Add User Message
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      // Connect to your backend
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "Sorry, I encountered an issue. Please try again." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to the server. Is the backend running?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm">Vagarious AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-blue-700 p-1 rounded transition"
              aria-label="Minimize Chat"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our services..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              aria-label="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600"
        } text-white`}
        aria-label="Toggle Chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default Chatbot;
>>>>>>> b2f902fb7074265c690bd0d496376c8f821b4659
