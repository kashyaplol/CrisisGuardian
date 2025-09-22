import React from 'react';
import { View } from '../types';
import { ShieldCheckIcon } from './icons/Icons';

interface WelcomeProps {
  setView: (view: View) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ setView }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animated-gradient">
      <div className="text-center w-full max-w-2xl animate-fade-in-up">
        <ShieldCheckIcon className="h-20 w-20 text-white mx-auto drop-shadow-lg" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-4 drop-shadow-md">
          CrisisGuardian
        </h1>
        <p className="mt-4 text-lg md:text-xl text-slate-100 max-w-xl mx-auto drop-shadow-sm">
          Your digital guide to disaster preparedness. Learn, practice, and stay safe with interactive modules and AI-powered virtual drills.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setView('login')}
            className="w-full sm:w-auto bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105 shadow-lg"
          >
            Login
          </button>
          <button
            onClick={() => setView('signup')}
            className="w-full sm:w-auto bg-blue-600/50 text-white font-bold py-3 px-8 rounded-full text-lg border-2 border-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-105 shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
