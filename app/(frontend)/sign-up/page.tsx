'use client';

import { useState, useEffect } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Bot, Sun, Moon, User, Mail, Lock, Key, Eye, EyeOff, Loader2 } from 'lucide-react';

const AuthApp = () => {
const { isLoaded, signUp, setActive } = useSignUp();
const router = useRouter();

const [isDarkMode, setIsDarkMode] = useState(true);
const [currentView, setCurrentView] = useState('signup');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [code, setCode] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [message, setMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
    if (isDarkMode) {
    document.documentElement.classList.add('dark');
    } else {
    document.documentElement.classList.remove('dark');
    }
}, [isDarkMode]);

const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setMessage('');

    try {
    await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
    });

    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    setMessage('A verification code has been sent to your email.');
    setCurrentView('verify');
    } catch (err) {
    console.error(JSON.stringify(err, null, 2));
    const clerkError = err.errors?.[0]?.longMessage || 'Something went wrong during sign up.';
    setMessage(clerkError);
    } finally {
    setIsLoading(false);
    }
};

const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setMessage('');

    try {
    const result = await signUp.attemptEmailAddressVerification({ code });

    if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/chat'); // Redirect to your main application feed
    } else {
        console.error(JSON.stringify(result, null, 2));
        setMessage('Invalid verification code. Please try again.');
    }
    } catch (err) {
    console.error(JSON.stringify(err, null, 2));
    const clerkError = err.errors?.[0]?.longMessage || 'Verification failed. Please try again.';
    setMessage(clerkError);
    } finally {
    setIsLoading(false);
    }
};

const handleSignIn = () => {
    router.push('/sign-in'); // Redirect to your Clerk Sign In page
};

const renderView = () => {
    switch (currentView) {
    case 'signup':
        return (
        <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-center text-foreground">Create an Account</h2>
            <p className="text-center text-muted-foreground">Join us to start chatting with Flowa AI.</p>
            {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sent') || message.includes('success') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                {message}
            </div>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="relative w-full">
                <User className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                    className="w-full p-2 pl-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
                />
                </div>
                <div className="relative w-full">
                <User className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                    className="w-full p-2 pl-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
                />
                </div>
            </div>
            <div className="relative">
                <Mail className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                id="email-signup"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" Email Id"
                required
                className="w-full p-2 pl-12 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-12"
                />
            </div>
            <div className="relative">
                <Lock className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                id="password-signup"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
                <span>{isLoading ? 'Sending Code...' : 'Create Account'}</span>
            </button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
                type="button"
                onClick={handleSignIn}
                className="text-primary hover:underline transition-colors"
            >
                Sign In
            </button>
            </div>
        </div>
        );
    case 'verify':
        return (
        <div className="w-full space-y-4">
            <h2 className="text-2xl font-bold text-center text-foreground">Verify Your Email</h2>
            <p className="text-center text-muted-foreground">We sent a verification code to <span className="font-semibold text-foreground">{email}</span>.</p>
            {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${message.includes('sent') || message.includes('successful') ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                {message}
            </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
                <Key className="h-5 w-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
                <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Verification Code"
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
                <span>{isLoading ? 'Verifying...' : 'Verify'}</span>
            </button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
            <button
                type="button"
                onClick={() => {
                setCurrentView('signup');
                setMessage('');
                }}
                className="text-primary hover:underline transition-colors"
            >
                Return to Sign Up
            </button>
            </div>
        </div>
        );
    default:
        return null;
    }
};

if (!isLoaded) {
    return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
    );
}

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
        {renderView()}
    </div>
    </div>
);
};

export default AuthApp;