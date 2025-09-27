import React from 'react';
import { View } from '../types';
import { CrisisGuardianLogo } from './icons/Icons';

interface WelcomeProps {
  setView: (view: View) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ setView }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-bg] dark:bg-[--dark-bg] p-6 animate-fade-in-slow">
        <div className="w-full max-w-md text-center">
            <CrisisGuardianLogo className="justify-center mb-10" />
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
                Stay Safe. <span className="highlight-yellow"><span>Be Prepared.</span></span>
            </h1>
            <p className="mt-6 text-lg text-[--brand-slate] max-w-sm mx-auto">
                Join CrisisGuardian today to start your disaster preparedness training.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => setView('login')}
                    className="w-full sm:w-auto bg-[--brand-purple] text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-purple-700 focus:outline-none transition-all duration-300 transform hover:-translate-y-1 soft-shadow"
                >
                    Login
                </button>
                <button
                    onClick={() => setView('signup')}
                    className="w-full sm:w-auto bg-white text-[--brand-text] font-bold py-4 px-10 rounded-2xl text-lg border-2 border-black/5 hover:bg-black/5 focus:outline-none transition-all duration-300 transform hover:-translate-y-1 soft-shadow dark:bg-[--dark-surface] dark:text-white dark:border-white/10 dark:hover:bg-white/10"
                >
                    Sign Up
                </button>
            </div>
        </div>
    </div>
  );
};

export default Welcome;