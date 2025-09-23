import React, { useState } from 'react';
import { DisasterType, Difficulty } from '../types';
import { DISASTER_MODULES } from '../constants';
import { XCircleIcon, TrophyIcon, BoltIcon } from './icons/Icons';

interface DrillsLobbyProps {
  onStartDrill: (disasterType: DisasterType, difficulty: Difficulty) => void;
}

const DifficultyCard: React.FC<{
    difficulty: Difficulty;
    description: string;
    selected: boolean;
    onSelect: () => void;
}> = ({ difficulty, description, selected, onSelect }) => {
    const colorClasses = {
        [Difficulty.Easy]: 'border-green-500',
        [Difficulty.Medium]: 'border-yellow-500',
        [Difficulty.Hard]: 'border-red-500',
    };
    const bgClasses = {
        [Difficulty.Easy]: 'bg-green-100 dark:bg-green-900/50',
        [Difficulty.Medium]: 'bg-yellow-100 dark:bg-yellow-900/50',
        [Difficulty.Hard]: 'bg-red-100 dark:bg-red-900/50',
    };
    return (
        <button
            onClick={onSelect}
            className={`p-4 rounded-lg border-2 text-center transition-all duration-200 w-full
                ${selected ? `${colorClasses[difficulty]} ${bgClasses[difficulty]} ring-2 ${colorClasses[difficulty]}` : 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}
        >
            <h4 className="font-bold text-lg dark:text-slate-100">{difficulty}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </button>
    );
};

const DrillsLobby: React.FC<DrillsLobbyProps> = ({ onStartDrill }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; disasterType: DisasterType | null }>({ isOpen: false, disasterType: null });
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Easy);

  const handleOpenModal = (disasterType: DisasterType) => {
      setSelectedDifficulty(Difficulty.Easy); // Reset to easy on open
      setModalState({ isOpen: true, disasterType });
  };

  const handleCloseModal = () => {
      setModalState({ isOpen: false, disasterType: null });
  };
  
  const handleStart = () => {
      if (modalState.disasterType) {
          onStartDrill(modalState.disasterType, selectedDifficulty);
          handleCloseModal();
      }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Virtual Drills Lobby</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Test your knowledge in a simulated environment. Choose a scenario to begin.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DISASTER_MODULES.map((module) => (
          <div key={module.type} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300">
            <div className="p-6 bg-green-500 text-white flex justify-center items-center">
              <module.icon className="h-16 w-16" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">{module.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-4">{module.description}</p>
              <button
                onClick={() => handleOpenModal(module.type)}
                className="mt-auto w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <BoltIcon className="h-5 w-5" />
                Start Virtual Drill
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalState.isOpen && modalState.disasterType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
                <div className="p-6 border-b dark:border-slate-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold dark:text-slate-100">Select Difficulty</h3>
                        <p className="text-slate-600 dark:text-slate-400">Scenario: {modalState.disasterType}</p>
                    </div>
                    <button onClick={handleCloseModal} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                        <XCircleIcon className="h-7 w-7" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                        <div className="flex items-start">
                            <TrophyIcon className="h-6 w-6 text-blue-700 dark:text-blue-300 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Challenge Level</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">A higher difficulty means more steps and complex follow-up scenarios.</p>
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
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex justify-end gap-4">
                     <button 
                        onClick={handleCloseModal}
                        className="px-6 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleStart}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
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
