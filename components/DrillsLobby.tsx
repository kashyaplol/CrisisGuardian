import React, { useState } from 'react';
import { DisasterType, Difficulty, DrillMode } from '../types';
import { DISASTER_MODULES } from '../constants';
import { XCircleIcon, TrophyIcon, BoltIcon, FireIcon, ChevronDownIcon } from './icons/Icons';

interface DrillsLobbyProps {
  onStartDrill: (disasterType: DisasterType, difficulty: Difficulty, mode: DrillMode) => void;
}

const DifficultyCard: React.FC<{
    difficulty: Difficulty;
    description: string;
    selected: boolean;
    onSelect: () => void;
}> = ({ difficulty, description, selected, onSelect }) => {
    const colorClasses = {
        [Difficulty.Easy]: 'border-green-500 text-green-600 dark:text-green-300',
        [Difficulty.Medium]: 'border-yellow-500 text-yellow-600 dark:text-yellow-300',
        [Difficulty.Hard]: 'border-red-500 text-red-600 dark:text-red-300',
    };
    const bgClasses = {
        [Difficulty.Easy]: 'bg-green-500/10 dark:bg-green-500/20',
        [Difficulty.Medium]: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        [Difficulty.Hard]: 'bg-red-500/10 dark:bg-red-500/20',
    };
    return (
        <button
            onClick={onSelect}
            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 w-full
                ${selected ? `${colorClasses[difficulty]} ${bgClasses[difficulty]} ring-2 ${colorClasses[difficulty]}` : 'bg-black/5 dark:bg-white/10 border-transparent hover:border-black/10 dark:hover:border-white/20'}`}
        >
            <h4 className={`font-bold text-lg ${selected ? '' : 'text-[--brand-text] dark:text-white'}`}>{difficulty}</h4>
            <p className="text-sm text-[--brand-slate]">{description}</p>
        </button>
    );
};

const DrillsLobby: React.FC<DrillsLobbyProps> = ({ onStartDrill }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; disasterType: DisasterType | null, mode: DrillMode }>({ isOpen: false, disasterType: null, mode: 'Standard' });
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Easy);

  const handleOpenModal = (disasterType: DisasterType, mode: DrillMode) => {
      setSelectedDifficulty(Difficulty.Easy); // Reset to easy on open
      setModalState({ isOpen: true, disasterType, mode });
  };

  const handleCloseModal = () => {
      setModalState({ isOpen: false, disasterType: null, mode: 'Standard' });
  };
  
  const handleStart = () => {
      if (modalState.disasterType) {
          onStartDrill(modalState.disasterType, selectedDifficulty, modalState.mode);
          handleCloseModal();
      }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold sm:text-5xl"><span className="underline-squiggle">Virtual Drills Lobby</span></h1>
        <p className="mt-4 text-lg text-[--brand-slate]">Test your knowledge in a simulated environment. Choose a scenario to begin.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
         <div className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow soft-shadow-hover overflow-hidden flex flex-col lg:col-span-2 lg:flex-row">
            <div className="p-8 bg-yellow-400 flex justify-center items-center lg:w-1/3">
              <TrophyIcon className="h-24 w-24 text-yellow-700" />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold mb-2">Survival Mode</h3>
              <p className="text-[--brand-slate] flex-grow mb-6">Face an endless series of scenarios. One wrong move, and it's over. How long can you last?</p>
              <button
                onClick={() => handleOpenModal(DISASTER_MODULES[0].type, 'Survival')} // Start with a default, user can change in modal
                className="mt-auto w-full lg:w-auto bg-[--brand-yellow] text-[--brand-text] font-bold py-3 px-6 rounded-2xl hover:bg-yellow-500 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <TrophyIcon className="h-5 w-5" />
                Start Survival Drill
              </button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DISASTER_MODULES.map((module) => (
          <div key={module.type} className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow soft-shadow-hover overflow-hidden flex flex-col">
            <div className="p-6 bg-purple-500 flex justify-center items-center h-32">
              <img src={module.icon} alt={module.title} className="h-16 w-16 filter brightness-0 invert" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
              <p className="text-[--brand-slate] text-sm flex-grow mb-6">{module.description}</p>
              <button
                onClick={() => handleOpenModal(module.type, 'Standard')}
                className="mt-auto w-full bg-[--brand-purple] text-white font-bold py-3 px-4 rounded-2xl hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <BoltIcon className="h-5 w-5" />
                Start Standard Drill
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalState.isOpen && modalState.disasterType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-[--dark-surface] rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold">
                            {modalState.mode === 'Survival' ? 'Start Survival Mode' : 'Select Difficulty'}
                        </h3>
                        <p className="text-[--brand-slate]">
                           {modalState.mode === 'Survival' ? 'Choose your starting scenario' : `Scenario: ${modalState.disasterType}`}
                        </p>
                    </div>
                    <button onClick={handleCloseModal} className="text-slate-500 hover:text-[--brand-text] dark:text-slate-400 dark:hover:text-slate-100">
                        <XCircleIcon className="h-7 w-7" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    {modalState.mode === 'Survival' ? (
                        <div>
                             <label htmlFor="disaster-type" className="block text-sm font-semibold text-[--brand-slate] mb-2">Starting Disaster Type</label>
                             <div className="relative">
                                <select 
                                    id="disaster-type"
                                    value={modalState.disasterType}
                                    onChange={(e) => setModalState({...modalState, disasterType: e.target.value as DisasterType})}
                                    className="w-full appearance-none py-3 px-4 pr-10 bg-black/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors hover:bg-black/10 dark:hover:bg-white/20 font-semibold"
                                >
                                    {DISASTER_MODULES.map(m => <option className="font-semibold bg-white dark:bg-[--dark-surface]" key={m.type} value={m.type}>{m.title}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                    <ChevronDownIcon className="h-5 w-5" />
                                </div>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <div className="flex items-start">
                                    <TrophyIcon className="h-6 w-6 text-purple-700 dark:text-purple-300 mr-3 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-purple-800 dark:text-purple-200">Challenge Level</h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">A higher difficulty means more steps and complex follow-up scenarios.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <DifficultyCard 
                                    difficulty={Difficulty.Easy} 
                                    description="1 Step Scenario" 
                                    selected={selectedDifficulty === Difficulty.Easy} 
                                    onSelect={() => setSelectedDifficulty(Difficulty.Easy)} 
                                />
                                <DifficultyCard 
                                    difficulty={Difficulty.Medium} 
                                    description="2 Step Scenario" 
                                    selected={selectedDifficulty === Difficulty.Medium} 
                                    onSelect={() => setSelectedDifficulty(Difficulty.Medium)} 
                                />
                                <DifficultyCard 
                                    difficulty={Difficulty.Hard} 
                                    description="3 Step Scenario" 
                                    selected={selectedDifficulty === Difficulty.Hard} 
                                    onSelect={() => setSelectedDifficulty(Difficulty.Hard)} 
                                />
                            </div>
                        </>
                    )}
                </div>
                
                <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex justify-end gap-4">
                     <button 
                        onClick={handleCloseModal}
                        className="px-6 py-2 rounded-2xl bg-black/10 text-[--brand-text] font-semibold hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleStart}
                        className="px-6 py-2 rounded-2xl bg-[--brand-purple] text-white font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Start Drill
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DrillsLobby;