import React, { useState } from 'react';
import { View } from '../types';
import { CrisisGuardianLogo, EnvelopeIcon, ArrowPathIcon } from './icons/Icons';

interface ForgotPasswordProps {
  onStartForgotPassword: (email: string) => Promise<boolean>;
  setView: (view: View) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onStartForgotPassword, setView }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    setIsLoading(true);
    // We call the function regardless, but we don't need the result here.
    // This prevents revealing whether an email is registered.
    await onStartForgotPassword(email);
    setIsLoading(false);
    
    // For security, show a generic message either way.
    setMessage('If an account with that email exists, a verification code has been sent.');
    setError(''); // Clear any previous errors
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in-slow">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593941707882-6828203993b0?q=80&w=2574&auto=format&fit=crop')`, opacity: 0.15 }}
        ></div>
        <div className="z-10 text-center">
          <CrisisGuardianLogo className="justify-center" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-in-from-right">
          <div className="text-center lg:hidden mb-8">
            <CrisisGuardianLogo className="justify-center" />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Reset Password</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Enter your email to receive a verification code.</p>
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
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-600 dark:text-green-400 text-sm text-center">{message}</p>}

            <button
              type="submit"
              disabled={isLoading || !!message}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                  Processing...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Remembered your password?{' '}
            <button onClick={() => setView('login')} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;