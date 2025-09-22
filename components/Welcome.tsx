import React from 'react';
import { View } from '../types';
import { CrisisGuardianLogo, BookOpenIcon, BoltIcon, UsersIcon } from './icons/Icons';

interface WelcomeProps {
  setView: (view: View) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ setView }) => {
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

      {/* Right Content Panel - Redesigned for a crisper, more engaging CTA */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-in-from-right text-center">
            <div className="lg:hidden mb-8">
                <CrisisGuardianLogo className="justify-center" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Build Resilience.<br/>Ensure Safety.
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Join CrisisGuardian today to start your preparedness training.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => setView('login')}
                    className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-base hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                    Login
                </button>
                <button
                    onClick={() => setView('signup')}
                    className="w-full sm:w-auto bg-white text-slate-700 font-bold py-3 px-8 rounded-lg text-base border-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all transform hover:-translate-y-1 shadow-lg dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                    Sign Up
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;