import React, { useState, useRef, useEffect } from 'react';
import { CrisisGuardianLogo } from './icons/Icons';
import * as authService from '../services/authService';

type AuthInfo = {
  flow: 'signup' | 'forgotPassword';
  email: string;
};

interface VerifyOtpProps {
  authInfo: AuthInfo;
  onVerified: (email: string) => void;
  otpHint?: string;
}

const VerifyOtp: React.FC<VerifyOtpProps> = ({ authInfo, onVerified, otpHint }) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-bg] dark:bg-[--dark-bg] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <CrisisGuardianLogo className="justify-center" />
        </div>
        <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-[--brand-slate] mt-2">
              {subTitle} <span className="font-semibold text-[--brand-text] dark:text-slate-200">{email}</span>.
            </p>
            {showHint && otpHint && (
              <p className="mt-4 p-3 bg-purple-500/5 dark:bg-white/5 rounded-xl text-sm text-[--brand-slate]">
                  (For testing, your code is: <span className="font-bold text-[--brand-text] dark:text-white">{otpHint}</span>)
              </p>
            )}
          </div>

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
                  ref={el => { if (el) { inputsRef.current[index] = el; } }}
                  className="w-12 h-14 text-center text-2xl font-semibold bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center my-4">{error}</p>}

            <button
              type="submit"
              className="w-full mt-6 bg-[--brand-purple] text-white font-bold py-4 px-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1"
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