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
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Welcome, <span className="highlight-yellow"><span>{user.name}!</span></span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[--brand-slate] max-w-2xl mx-auto">
          Ready to become a CrisisGuardian? Learn essential safety skills and test your knowledge with real-world virtual drills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-[--brand-white] dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow soft-shadow-hover flex flex-col items-center">
          <div className="p-4 bg-purple-500/10 rounded-full mb-6">
            <BookOpenIcon className="h-10 w-10 text-purple-600 dark:text-purple-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3"><span className="underline-squiggle">Explore Modules</span></h2>
          <p className="text-[--brand-slate] mb-8 text-center flex-grow">
            Dive into our educational modules covering earthquakes, floods, fires, and more.
          </p>
          <button
            onClick={() => setView('modules')}
            className="w-full bg-[--brand-light-purple] dark:bg-purple-500/20 text-[--brand-text] dark:text-white font-bold py-4 px-6 rounded-2xl hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Learning
          </button>
        </div>
        <div className="bg-[--brand-white] dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow soft-shadow-hover flex flex-col items-center">
          <div className="p-4 bg-yellow-500/10 rounded-full mb-6">
            <BoltIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3"><span className="underline-squiggle">Launch a Drill</span></h2>
          <p className="text-[--brand-slate] mb-8 text-center flex-grow">
            Experience a realistic disaster scenario and make critical decisions in a safe environment.
          </p>
          <button
            onClick={() => setView('drills')}
            className="w-full bg-[--brand-purple] text-white font-bold py-4 px-6 rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Begin Virtual Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;