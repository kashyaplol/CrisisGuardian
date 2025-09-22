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
      <div
        className="bg-cover bg-center rounded-lg shadow-lg p-12 md:p-20 mb-8"
        style={{ backgroundImage: `url('https://picsum.photos/1200/400?grayscale&blur=2')` }}
      >
        <div className="bg-black bg-opacity-50 rounded-lg p-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Welcome, {user.name}!
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
            Ready to become a CrisisGuardian? Learn essential safety skills and test your knowledge with real-world virtual drills.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-slate-100">Explore Modules</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Dive into our educational modules covering earthquakes, floods, fires, and more.
          </p>
          <button
            onClick={() => setView('modules')}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
          >
            Start Learning
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <BoltIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-slate-100">Launch a Drill</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Experience a realistic disaster scenario and make critical decisions in a safe environment.
          </p>
          <button
            onClick={() => setView('drills')}
            className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
          >
            Begin Virtual Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;