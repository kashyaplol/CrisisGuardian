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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-beige] dark:bg-[--dark-bg] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <CrisisGuardianLogo className="justify-center" />
        </div>
        <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[--brand-charcoal] dark:text-white">Reset Password</h2>
            <p className="text-[--brand-slate] dark:text-slate-400 mt-2">Enter your email to receive a verification code.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[--brand-slate] dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-black/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-orange] focus:ring-0 rounded-2xl transition-colors"
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-600 dark:text-green-400 text-sm text-center">{message}</p>}

            <button
              type="submit"
              disabled={isLoading || !!message}
              className="w-full bg-[--brand-orange] text-white font-bold py-4 px-4 rounded-2xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
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
        </div>
        <p className="text-center text-sm text-[--brand-slate] dark:text-slate-400 mt-8">
          Remembered your password?{' '}
          <button onClick={() => setView('login')} className="font-bold text-[--brand-orange] hover:underline">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;