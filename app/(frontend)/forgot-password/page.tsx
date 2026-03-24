'use client';

import { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Sun, Moon, Mail, Lock, Key, Eye, EyeOff, Loader2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setMessage('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setIsEmailSent(true);
      setMessage('A password reset code has been sent to your email.');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const clerkError = err.errors?.[0]?.longMessage || 'Failed to send password reset code. Please try again.';
      setMessage(clerkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setMessage('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setMessage('Your password has been reset successfully!');
        router.push('/sign-in');
      } else {
        console.error(JSON.stringify(result, null, 2));
        setMessage('Invalid code or password. Please try again.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const clerkError = err.errors?.[0]?.longMessage || 'Password reset failed. Please try again.';
      setMessage(clerkError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderForm = () => {
    if (isEmailSent) {
      // Step 2: Verify Code and Set New Password
      return (
        <div className="w-full space-y-4">
          <h2 className="text-2xl font-bold text-center text-foreground">Reset Your Password</h2>
          <p className="text-center text-muted-foreground">Enter the code from your email and a new password.</p>
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('successfully') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Key className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Password Reset Code"
                required
                className="w-full p-2 pl-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
              />
            </div>
            <div className="relative">
              <Lock className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                className="w-full p-2 pl-12 pr-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold transition-all duration-200 hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 h-12"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      );
    }

    // Step 1: Request Password Reset
    return (
      <div className="w-full space-y-4">
        <h2 className="text-2xl font-bold text-center text-foreground">Forgot Password?</h2>
        <p className="text-center text-muted-foreground">Enter your email and we'll send you a password reset code.</p>
        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sent') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="relative">
            <Mail className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 pl-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold transition-all duration-200 hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 h-12"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLoading ? 'Sending Code...' : 'Send Reset Code'}</span>
          </button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline transition-colors">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4 font-sans bg-background text-foreground transition-colors duration-200">
      <div className="flex items-center space-x-2 mb-8 md:absolute md:top-8 md:left-8">
        <div className="p-2 bg-primary rounded-lg text-primary-foreground">
          <Bot className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Flowa AI</h1>
      </div>
      <div className="absolute top-8 right-8">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-xl shadow-lg">
        {renderForm()}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;