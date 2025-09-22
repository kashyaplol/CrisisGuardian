import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheckIcon } from './icons/Icons';
import * as authService from '../services/authService';

type AuthInfo = {
  flow: 'login' | 'signup';
  email: string;
  name?: string;
  role?: string;
};

interface VerifyOtpProps {
  authInfo: AuthInfo;
  onVerified: (email: string) => void;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ authInfo, onVerified }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [showHint, setShowHint] = useState(true);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    inputsRef.current[0]?.focus();
  }, []);
  
  // Hide the hint after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      // Move focus to the previous input field on backspace
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          inputsRef.current[index - 1]?.focus();
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    const isValid = authService.verifyOtp(authInfo.email, enteredOtp);

    if (isValid) {
      onVerified(authInfo.email);
    } else {
      setError('The code you entered is incorrect or has expired. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">Check Your Email</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            We've sent a 6-digit verification code to <span className="font-semibold text-slate-800 dark:text-slate-200">{authInfo.email}</span>.
          </p>
        </div>
        
        {showHint && (
             <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center dark:bg-blue-900/20 dark:border-blue-500/30">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-bold">Developer Hint:</span> Check the browser's developer console to find the simulated OTP code.
                </p>
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-4">
                {otp.map((data, index) => (
                    <input
                        key={index}
                        type="text"
                        name="otp"
                        maxLength={1}
                        value={data}
                        onChange={e => handleChange(e.target, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        onFocus={e => e.target.select()}
                        ref={el => { inputsRef.current[index] = el; }}
                        className="w-12 h-14 text-center text-2xl font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-slate-700 dark:border-slate-600"
                    />
                ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
                Verify & {authInfo.flow === 'login' ? 'Login' : 'Sign Up'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;