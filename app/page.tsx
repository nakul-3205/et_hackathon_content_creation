'use client';

import { useState, useEffect } from 'react';
import { Bot, Sun, Moon, Zap, Layers, Globe, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const features = [
    {
      icon: <Layers className="h-8 w-8 text-primary" />,
      title: 'Multi-Model Intelligence',
      description: 'Our system queries multiple AI models in parallel (including Gemma, Mistral, and LLaMA) to find the most accurate and relevant response for your query.',
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Grounded Content',
      description: 'We perform a real-time web search for every user input, ensuring the AI-generated content is accurate, factual, and based on the latest information.',
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Personalized Workflows',
      description: 'Tailor the platform to your needs. Create custom workflows that combine different AI models and tools to streamline your creative process.',
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: 'Intelligent Aggregation',
      description: 'The platform aggregates and scores responses from all models, intelligently selecting the most accurate and context-aware answer to deliver superior results.',
    },
  ];

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
          <a href="/sign-in" className="hidden sm:inline-block p-2 text-foreground font-medium hover:text-primary transition-colors">
            Sign In
          </a>
          <a href="/sign-up" className="p-2 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors">
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center p-8 md:p-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight animate-fade-in-up">
            Create, Collaborate, and Innovate with AI
          </h2>
          <p className="mt-4 max-w-xl text-lg sm:text-xl text-muted-foreground animate-fade-in delay-200">
            Flowa AI is a sophisticated AI-powered platform for content creators and teams. Get the best of multiple AI models, grounded in real-time web data.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in delay-400">
            <a href="/sign-up" className="p-4 px-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/80 transition-colors shadow-lg">
              Start for Free
            </a>
            <a href="/sign-in" className="p-4 px-8 rounded-lg border border-border text-foreground font-bold text-lg hover:bg-muted/30 transition-colors shadow-lg">
              Sign In
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-bold">The Power of Aggregation</h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Unlike a single model, Flowa AI leverages a powerful multi-model engine to deliver superior results.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="group flex flex-col items-center text-center p-6 bg-card border border-border rounded-xl shadow-md transition-all duration-300 hover:scale-105">
                  <div className="p-3 rounded-full bg-primary/10 mb-4 transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-xl transition-colors duration-300 group-hover:text-primary">{feature.title}</h4>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center">How It Works</h3>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              A glimpse into the advanced architecture that powers your content.
            </p>
            <div className="mt-12 space-y-8 md:space-y-0 md:flex md:items-center md:space-x-8">
              <div className="flex-1 p-6 bg-card border border-border rounded-xl shadow-md flex items-center justify-center h-24 animate-fade-in-up">
                <p className="font-medium text-lg text-center">1. User submits a prompt</p>
              </div>
              <ArrowRight className="h-8 w-8 text-primary mx-auto md:mx-0 transform rotate-90 md:rotate-0 animate-fade-in" />
              <div className="flex-1 p-6 bg-card border border-border rounded-xl shadow-md flex items-center justify-center h-24 animate-fade-in-up delay-300">
                <p className="font-medium text-lg text-center">2. Web search & parallel AI queries</p>
              </div>
              <ArrowRight className="h-8 w-8 text-primary mx-auto md:mx-0 transform rotate-90 md:rotate-0 animate-fade-in delay-500" />
              <div className="flex-1 p-6 bg-card border border-border rounded-xl shadow-md flex items-center justify-center h-24 animate-fade-in-up delay-700">
                <p className="font-medium text-lg text-center">3. Intelligent aggregation & response</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 text-center bg-primary/10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Where innovation meets intelligence.
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Join a community of forward-thinkers. Unleash your potential and create content that stands out.
            </p>
            <div className="mt-8 flex justify-center">
              <a href="/sign-up" className="p-4 px-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/80 transition-colors shadow-lg">
                Sign Up Now
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Flowa AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
