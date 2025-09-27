import React, { useState } from 'react';
import { CrisisGuardianLogo, LockClosedIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface ResetPasswordProps {
  onResetPassword: (password: string) => Promise<void>;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onResetPassword }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    await onResetPassword(password);
    // The App component will handle navigation away from this view,
    // so we don't need to set isLoading(false) here.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-bg] dark:bg-[--dark-bg] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <CrisisGuardianLogo className="justify-center" />
        </div>
        <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Set New Password</h2>
            <p className="text-[--brand-slate] mt-2">Create a new, secure password for your account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[--brand-slate] mb-2">
                New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" />
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[--brand-text] dark:hover:text-white"
                >
                  {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-[--brand-slate] mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" />
                <input
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[--brand-text] dark:hover:text-white"
                >
                  {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[--brand-purple] text-white font-bold py-4 px-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                  Processing...
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;