import React, { useState } from 'react';
import { View } from '../types';
import { CrisisGuardianLogo, EnvelopeIcon, LockClosedIcon, BookOpenIcon, BoltIcon, UsersIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  setView: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    const success = onLogin(email, password);

    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
       {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in-slow">
         <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593941707882-6828203993b0?q=80&w=2574&auto=format&fit=crop')`, opacity: 0.15 }}
        ></div>
         <div className="z-10 text-center">
            <CrisisGuardianLogo className="justify-center mb-6" />
            <p className="text-slate-300 text-lg max-w-sm">
                Empowering campuses with the knowledge to face disasters with confidence.
            </p>
            <div className="mt-12 space-y-6 text-left w-full max-w-xs mx-auto">
                <div className="flex items-center gap-4">
                    <BookOpenIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">In-Depth Study Modules</p>
                </div>
                <div className="flex items-center gap-4">
                    <BoltIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">AI-Powered Virtual Drills</p>
                </div>
                 <div className="flex items-center gap-4">
                    <UsersIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">Campus-Wide Analytics</p>
                </div>
            </div>
         </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-in-from-right">
            <div className="text-center lg:hidden mb-8">
                <CrisisGuardianLogo className="justify-center" />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Log in to your account.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <EnvelopeIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                      required
                    />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LockClosedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                      required
                    />
                </div>
              </div>
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
              >
                Login
              </button>
            </form>
             <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Don't have an account?{' '}
                <button onClick={() => setView('signup')} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Sign Up
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;