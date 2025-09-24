import React, { useState } from 'react';
import { View } from '../types';
import { CrisisGuardianLogo, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  setView: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTestLogin = (role: 'student' | 'admin') => {
    if (role === 'student') {
        setEmail('student@test.com');
        setPassword('password');
    } else {
        setEmail('admin@test.com');
        setPassword('password');
    }
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    const success = await onLogin(email, password);
    setIsLoading(false);

    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-beige] dark:bg-[--dark-bg] p-6">
      <div className="w-full max-w-md">
          <div className="text-center mb-10">
              <CrisisGuardianLogo className="justify-center" />
          </div>
          <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[--brand-charcoal] dark:text-white">Welcome Back!</h2>
              <p className="text-[--brand-slate] dark:text-slate-400 mt-2">Log in to your account.</p>
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
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[--brand-slate] dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 bg-black/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-orange] focus:ring-0 rounded-2xl transition-colors"
                      required
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[--brand-charcoal] dark:hover:text-white"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                        {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
              </div>
              
               <div className="flex items-center justify-end">
                  <button
                      type="button"
                      onClick={() => setView('forgotPassword')}
                      className="text-sm font-semibold text-[--brand-orange] hover:underline"
                  >
                      Forgot password?
                  </button>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[--brand-orange] text-white font-bold py-4 px-4 rounded-2xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                    <>
                        <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                        Processing...
                    </>
                ) : (
                    'Login'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                <h4 className="text-sm font-semibold text-center text-[--brand-slate] dark:text-slate-400 mb-3">For Testing & Demo</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                    type="button"
                    onClick={() => handleTestLogin('student')}
                    className="w-full text-sm bg-white dark:bg-[--dark-surface] border-2 border-black/10 dark:border-white/10 text-[--brand-charcoal] dark:text-white font-bold py-2 px-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                    Login as Student
                    </button>
                    <button
                    type="button"
                    onClick={() => handleTestLogin('admin')}
                    className="w-full text-sm bg-white dark:bg-[--dark-surface] border-2 border-black/10 dark:border-white/10 text-[--brand-charcoal] dark:text-white font-bold py-2 px-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                    Login as Admin
                    </button>
                </div>
            </div>
        </div>
         <p className="text-center text-sm text-[--brand-slate] dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <button onClick={() => setView('signup')} className="font-bold text-[--brand-orange] hover:underline">
                Sign Up
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;