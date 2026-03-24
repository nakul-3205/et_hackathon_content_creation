'use client'
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isStreaming?: boolean;
}

const suggestedPrompts = [
  "Write a blog post about AI productivity",
  "Create a social media strategy",
  "Help me brainstorm content ideas",
  "Draft a professional email",
  "Generate creative writing prompts"
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentInput,
          context: messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response || result.message || "I received your message but couldn't generate a proper response.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-ai-gradient rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">AI Chat Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {isTyping ? "AI is typing..." : "Ready to help with your content creation"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-ai-gradient-subtle rounded-2xl mb-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start a conversation with Flowa AI
              </h3>
              <p className="text-muted-foreground mb-8">
                Choose a prompt below or type your own message to begin
              </p>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptSelect(prompt)}
                    className="p-4 text-left bg-card border border-border hover:border-primary/50 rounded-xl transition-all duration-200 hover:shadow-ai group"
                  >
                    <div className="flex items-start space-x-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 group-hover:text-primary-glow transition-colors" />
                      <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[80%] space-x-3 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      message.sender === "user" 
                        ? "bg-ai-gradient" 
                        : "bg-muted"
                    }`}>
                      {message.sender === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-ai ${
                      message.sender === "user"
                        ? "bg-ai-gradient text-white"
                        : "bg-card border border-border"
                    }`}>
                      <p className={`text-sm ${message.sender === "user" ? "text-white" : "text-card-foreground"}`}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 ${
                        message.sender === "user" 
                          ? "text-white/70" 
                          : "text-muted-foreground"
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] space-x-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-4 rounded-2xl shadow-ai bg-card border border-border">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message to Flowa AI..."
            className="flex-1 bg-background border-border focus:border-primary"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-ai-gradient hover:shadow-ai-glow transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}