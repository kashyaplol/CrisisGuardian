import React, { useState } from 'react';
import { View } from '../types';
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon } from './icons/Icons';

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
    <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">Welcome Back</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Log in to your CrisisGuardian account.</p>
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
            <label htmlFor="password" cla-ssName="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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
  );
};

export default Login;