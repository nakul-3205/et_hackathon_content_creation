'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Button } from '@/components/ui/button';
import { User, LogOut, Sun, Moon, MessageSquare } from 'lucide-react';

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const firstInitial = firstName ? firstName.charAt(0) : '';
  const lastInitial = lastName ? lastName.charAt(0) : '';
  return (firstInitial + lastInitial).toUpperCase();
};

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 p-4">
        <p className="mb-4 text-center">You are not signed in. Please sign in to view your settings.</p>
        <Button onClick={() => router.push('/sign-in')}>Go to Sign In</Button>
      </div>
    );
  }

  const { firstName, lastName, emailAddresses, imageUrl, fullName } = user;

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-300 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      
      {/* Top right controls */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
          onClick={() => router.push('/chat')}
          title="Go to Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          className="rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
      
      {/* User info section */}
      <div className="w-full max-w-lg mx-auto">
        <div className="flex flex-col items-center space-y-6 mb-12">
          <Avatar className="h-24 w-24 md:h-28 md:w-28 rounded-full">
            <AvatarImage src={imageUrl} alt={fullName || ''} className="rounded-full" />
            <AvatarFallback className="text-4xl rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center h-full w-full">
              {getInitials(firstName, lastName) || <User className="h-12 w-12 text-neutral-500" />}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl md:text-2xl font-semibold text-center mt-4">
            {fullName || 'User'}
          </h1>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">First Name</p>
            <p className="text-sm md:text-base mt-1 font-medium">{firstName || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Last Name</p>
            <p className="text-sm md:text-base mt-1 font-medium">{lastName || 'N/A'}</p>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Email Address</p>
            <p className="text-sm md:text-base mt-1 font-medium">{emailAddresses?.[0]?.emailAddress || 'N/A'}</p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-12">
          This page is for demonstration. More settings would be added soon.
        </p>
      </div>
    </div>
  );
}
