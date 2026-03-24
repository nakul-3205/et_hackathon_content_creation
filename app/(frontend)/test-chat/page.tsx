'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

// Import Shadcn UI components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import Icons
import { User, Settings, LogOut, MessageSquarePlus, Sun, Moon, PanelLeft, PanelRight, Bot, BrainCircuit, ChevronDown, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatSummary {
  chatId: string;
  title: string;
}

const LOADING_MESSAGES = [
  "Firing up the neurons...",
  "Brewing some digital coffee...",
  "Consulting the wise ones...",
  "Calibrating the cosmic ray scanner...",
  "Summoning the spirits of data...",
  "Putting on my thinking cap...",
  "Just a moment, finding my words...",
  "Wrestling a data dragon...",
  "Untangling the web of information...",
  "Polishing my thoughts...",
  "Thinking... therefore, I am... cooking!",
  "Searching for the perfect emoji...",
  "Accessing the mainframe...",
  "Connecting to the cloud of creativity...",
  "Checking for cosmic downloads...",
  "Asking the universe for an answer...",
  "Almost there, just a few more bytes...",
  "Crunching numbers and poetry...",
];

const RECOMMENDED_PROMPTS = [
  "Write a LinkedIn post about the importance of continuous learning in tech.",
  "Generate a 3-point blog post outline about the future of remote work.",
  "Draft a compelling YouTube video script for a product launch.",
  "Create a social media caption for an Instagram post about productivity tips.",
  "Write a short, engaging email newsletter announcing a new feature.",
  "Brainstorm 5 catchy headlines for a blog article on personal finance.",
  "Compose a script for a 30-second promotional video.",
  "Write a case study on how a small business used content marketing to grow.",
  "Create a list of 10 tweet ideas for a brand in the wellness industry.",
  "Generate a press release for a new mobile app focused on creativity.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatListLoading, setIsChatListLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<ChatSummary[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainChatRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);

  const { user, signOut } = useClerk();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const selectRandomPrompts = () => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random());
    setPrompts(shuffled.slice(0, 4));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const chatContainer = mainChatRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const isScrolledToBottom = chatContainer.scrollHeight - chatContainer.clientHeight <= chatContainer.scrollTop + 100;
      setShowScrollToBottomButton(!isScrolledToBottom);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'ai' && !isLoading) {
      scrollToBottom();
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      let currentIndex = 0;
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[currentIndex]);
      }, 2000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const fetchChatList = async () => {
    setIsChatListLoading(true);
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chats: ChatSummary[] = await response.json();
        setChatList(chats);
        if (!chatId && chats.length > 0) {
          fetchChatConversation(chats[0].chatId);
        }
      } else {
        throw new Error('Failed to fetch chat list');
      }
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
      toast.error('Failed to load your chats. Please try refreshing the page.');
    } finally {
      setIsChatListLoading(false);
    }
  };

  const fetchChatConversation = async (id: string) => {
    if (isLoading) {
      toast.error("Please wait for the AI to finish its response.");
      return;
    }
    setIsLoading(true);
    setChatId(id);
    setMessages([]);
    try {
      const response = await fetch(`/api/chat?chatId=${id}`);
      if (response.ok) {
        const { messages } = await response.json();
        setMessages(messages);
      } else {
        throw new Error('Failed to fetch conversation');
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages([{ role: 'ai', content: "Sorry, I couldn't load this chat. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  const handleNewChat = () => {
    if (isLoading || isChatListLoading) {
      toast.error("Please wait for the AI to finish its response or for chats to load.");
      return;
    }
    setChatId(null);
    setMessages([]);
    setInput('');
    selectRandomPrompts();
    setIsLoading(false);
  };
  
  const handleDropdownClick = (action: 'settings' | 'logout') => {
    if (isLoading || isChatListLoading) {
        toast.error("Please wait for the AI to finish its response.");
        return;
    }
    if (action === 'settings') {
        router.push('/settings');
    } else if (action === 'logout') {
        signOut();
    }
  };

  const handleSend = async (e: FormEvent, prompt?: string) => {
    e.preventDefault();
    const content = prompt || input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: content };
    const localChatId = chatId;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatPostResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: localChatId,
          role: 'user',
          content: userMessage.content,
        }),
      });

      if (!chatPostResponse.ok) {
        throw new Error('Failed to save user message');
      }

      const chatPostResult = await chatPostResponse.json();

      if (!localChatId) {
        const newChatId = chatPostResult.chatId;
        setChatId(newChatId);
        setChatList(prev => [{ chatId: newChatId, title: content.substring(0, 20) + '...' }, ...prev]);
      }

      const context = messages.slice(-5);
      const queryPayload = {
        query: userMessage.content,
        context: [...context, userMessage]
      };

      const queryResponse = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryPayload),
      });

      if (!queryResponse.ok) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (queryResponse.status === 429) {
          errorMessage = 'Too many requests, please try again later.';
        } else {
          try {
            const errorData = await queryResponse.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = 'Failed to get a response from the server. Check your network or try again later.';
          }
        }
        throw new Error(errorMessage);
      }

      const { finalAnswer } = await queryResponse.json();
      const aiMessage: Message = { role: 'ai', content: finalAnswer };

      if (localChatId === chatId) {
        setMessages(prev => [...prev, aiMessage]);
      }

      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: localChatId || chatPostResult.chatId,
          role: 'ai',
          content: aiMessage.content,
        }),
      });

    } catch (error: any) {
      console.error('Error in chat flow:', error);
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: error.message || "An unexpected error occurred. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f0f0f] dark:text-white text-neutral-800 font-sans antialiased overflow-hidden">
      
      {/* Custom Scrollbar Styles for the Sidebar and Main Chat Area */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #8888884d;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #8888884d;
        }
      `}</style>

      {!isSidebarOpen && (
        <div className="absolute top-4 left-2 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (isLoading) toast.error("Please wait for the AI to finish its response.");
              else setIsSidebarOpen(true);
            }} 
            disabled={isLoading}>
            <PanelRight className="w-6 h-6" />
          </Button>
        </div>
      )}

      <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-neutral-800 flex flex-col p-4 space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className={`w-6 h-6 text-blue-500 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} />
            <h2 className={`text-xl font-bold transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Flowa AI</h2>
          </div>
          {isSidebarOpen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (isLoading) toast.error("Please wait for the AI to finish its response.");
                      else setIsSidebarOpen(false);
                    }} 
                    disabled={isLoading}>
                    <PanelLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Collapse Sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex justify-between items-center">
          {isSidebarOpen ? (
            <Button onClick={handleNewChat} variant="outline" className="w-full justify-start space-x-2" disabled={isLoading || isChatListLoading}>
              <MessageSquarePlus className="w-4 h-4" />
              <span>New Chat</span>
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleNewChat} variant="outline" size="icon" disabled={isLoading || isChatListLoading}>
                    <MessageSquarePlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className={`flex flex-col space-y-2 overflow-y-auto flex-1 custom-scrollbar`}>
          {isSidebarOpen && <h3 className="text-sm font-semibold text-gray-400 dark:text-neutral-500 mt-4 mb-2">Recent Chats</h3>}
          {isChatListLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          ) : chatList.length > 0 ? (
            chatList.map(chat => (
              <TooltipProvider key={chat.chatId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={chat.chatId === chatId ? 'secondary' : 'ghost'}
                      onClick={() => fetchChatConversation(chat.chatId)}
                      disabled={isLoading || isChatListLoading}
                      className={`w-full justify-start overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'py-2 px-3' : 'py-2 px-1'}`}
                    >
                      {isSidebarOpen ? (
                        <span className="truncate">{chat.title}</span>
                      ) : (
                        <span className="text-xs truncate">{chat.title.charAt(0)}..</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{chat.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))
          ) : (
            isSidebarOpen && <p className="text-xs text-gray-500 dark:text-neutral-600 text-center py-4">No recent chats.</p>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            {isSidebarOpen && <span className="text-sm font-medium">{user?.fullName || 'User'}</span>}
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled={isLoading || isChatListLoading} onClick={() => {
                     if (isLoading) toast.error("Please wait for the AI to finish its response.");
                }}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                    <AvatarFallback>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 rounded-md" align="end" forceMount>
                <DropdownMenuItem onClick={() => handleDropdownClick('settings')} disabled={isLoading || isChatListLoading}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDropdownClick('logout')} disabled={isLoading || isChatListLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-[#0a0a0a]">
        <div 
          ref={mainChatRef} 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 hide-scrollbar relative"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'End') {
              e.preventDefault();
              scrollToBottom();
            }
          }}
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-5xl font-extrabold mb-2 drop-shadow-md bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 text-transparent bg-clip-text">FLOWA AI</h1>
              <p className="text-lg text-gray-400 dark:text-neutral-600 mb-8">How can I help you today?</p>
              <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
                {prompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-4 px-6 text-left whitespace-normal break-words shadow-lg hover:shadow-none transition-shadow duration-200"
                    onClick={(e) => handleSend(e, prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`prose prose-sm dark:prose-invert max-w-[75%] rounded-2xl p-3 shadow-sm
                  ${message.role === 'user'
                    ? 'bg-blue-500 text-white self-end rounded-br-none'
                    : 'bg-white dark:bg-neutral-950 dark:text-neutral-100 rounded-bl-none border dark:border-neutral-600 border-gray-200'
                  }`}
              >
                {message.role === 'ai' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="flex-shrink-0 w-8 h-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 justify-start animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-bl-none p-3 shadow-sm bg-white dark:bg-neutral-950 animate-pulse border dark:border-neutral-600 border-gray-200">
                <p className="text-sm leading-relaxed dark:text-neutral-100">{loadingMessage}</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          <Button
            onClick={scrollToBottom}
            disabled={isLoading}
            className={`
              absolute bottom-4 right-4 z-10 w-12 h-12 rounded-full shadow-lg
              transition-all duration-300 ease-in-out
              ${showScrollToBottomButton ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-neutral-800 p-4 sm:p-6">
          <form onSubmit={handleSend} className="flex space-x-2">
            <textarea
              className="flex-1 resize-none rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-sm text-neutral-800 dark:text-neutral-200 px-4 py-3 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden max-h-[150px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              placeholder="Send a message..."
              disabled={isLoading || isChatListLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="w-10 h-10 rounded-full"
              disabled={isLoading || isChatListLoading || !input.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
