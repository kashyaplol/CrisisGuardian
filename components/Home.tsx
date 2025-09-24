import React from 'react';
import { View, User } from '../types';
import { BookOpenIcon, BoltIcon } from './icons/Icons';

interface HomeProps {
  setView: (view: View) => void;
  user: User;
}

const Home: React.FC<HomeProps> = ({ setView, user }) => {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-7xl font-bold text-[--brand-charcoal] dark:text-white leading-tight">
          Welcome, {user.name}!
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[--brand-slate] dark:text-slate-300 max-w-2xl mx-auto">
          Ready to become a CrisisGuardian? Learn essential safety skills and test your knowledge with real-world virtual drills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow soft-shadow-hover flex flex-col items-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-500/20 rounded-full mb-6">
            <BookOpenIcon className="h-10 w-10 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3 dark:text-white">Explore Modules</h2>
          <p className="text-[--brand-slate] dark:text-slate-400 mb-8 text-center flex-grow">
            Dive into our educational modules covering earthquakes, floods, fires, and more.
          </p>
          <button
            onClick={() => setView('modules')}
            className="w-full bg-[--brand-charcoal] dark:bg-slate-200 text-white dark:text-[--brand-charcoal] font-bold py-4 px-6 rounded-2xl hover:bg-black/80 dark:hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Learning
          </button>
        </div>
        <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow soft-shadow-hover flex flex-col items-center">
          <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-full mb-6">
            <BoltIcon className="h-10 w-10 text-green-600 dark:text-green-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3 dark:text-white">Launch a Drill</h2>
          <p className="text-[--brand-slate] dark:text-slate-400 mb-8 text-center flex-grow">
            Experience a realistic disaster scenario and make critical decisions in a safe environment.
          </p>
          <button
            onClick={() => setView('drills')}
            className="w-full bg-[--brand-orange] text-white font-bold py-4 px-6 rounded-2xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1"
          >
            Begin Virtual Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;