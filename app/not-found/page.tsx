'use client';

import { useState, useEffect } from 'react';
import { Bot, Home, Sun, Moon } from 'lucide-react';

const NotFoundPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground transition-colors duration-200">
      <header className="flex items-center justify-between p-4 md:p-8 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <Bot className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Flowa AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/auth/sign-in/sign-in" className="hidden sm:inline-block p-2 text-foreground font-medium hover:text-primary transition-colors">
            Sign In
          </a>
          <a href="/auth/sign-up/sign-up" className="p-2 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors">
            Get Started
          </a>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-9xl font-extrabold text-primary animate-pulse">404</h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4">Page Not Found</h2>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Oops! The page you're looking for seems to have gone on an adventure. Don't worry, we can get you back on track.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="p-4 px-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/80 transition-colors shadow-lg flex items-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go to Homepage</span>
          </a>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Flowa AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
