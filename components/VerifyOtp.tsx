import React, { useState, useRef, useEffect } from 'react';
import { CrisisGuardianLogo, BookOpenIcon, BoltIcon, UsersIcon } from './icons/Icons';
import * as authService from '../services/authService';

type AuthInfo = {
  flow: 'signup' | 'forgotPassword';
  email: string;
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

  const { flow, email } = authInfo;
  const title = flow === 'signup' ? 'Check Your Email' : 'Verify Your Identity';
  const subTitle = flow === 'signup' 
    ? `We've sent a 6-digit verification code to`
    : `For your security, please enter the 6-digit code sent to`;
  const buttonText = flow === 'signup' ? 'Verify & Sign Up' : 'Verify & Proceed';

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in-slow">
         <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593941707882-6828203993b0?q=80&w=2574&auto=format&fit=crop')`, opacity: 0.15 }}
        ></div>
         <div className="z-10 text-center">
            <CrisisGuardianLogo className="justify-center" />
         </div>
      </div>

      {/* Right Content Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-in-from-right">
            <div className="text-center lg:hidden mb-8">
                <CrisisGuardianLogo className="justify-center" />
            </div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {subTitle} <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
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
                            ref={el => { if (el) {inputsRef.current[index] = el}; }}
                            className="w-12 h-14 text-center text-2xl font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-slate-700 dark:border-slate-600"
                        />
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    {buttonText}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;