import React, { useState } from 'react';
import { DisasterModule } from '../types';
import { DISASTER_MODULES } from '../constants';
import { XCircleIcon, CheckCircleIcon, BookOpenIcon } from './icons/Icons';

const StudyMaterialModal: React.FC<{
  module: DisasterModule;
  onClose: () => void;
}> = ({ module, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-6 border-b dark:border-slate-700 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold dark:text-slate-100">{module.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">Key Information & Safety Protocols</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                    <XCircleIcon className="h-7 w-7" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Context</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{module.studyMaterial.introduction}</p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-3 dark:text-slate-200">Key Safety Points</h4>
                    <div className="space-y-4">
                        {module.studyMaterial.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-slate-800 dark:text-slate-200">{point.title}</h5>
                                    <p className="text-slate-600 dark:text-slate-400">{point.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex justify-end">
                 <button 
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
  );
};


const EducationModules: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<DisasterModule | null>(null);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Disaster Study Modules</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Choose a module to learn about specific disasters and enhance your preparedness knowledge.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DISASTER_MODULES.map((module) => (
          <div key={module.type} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300">
            <div className="p-6 bg-blue-500 text-white flex justify-center items-center">
              <module.icon className="h-16 w-16" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">{module.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-4">{module.description}</p>
              <button
                onClick={() => setSelectedModule(module)}
                className="mt-auto w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <BookOpenIcon className="h-5 w-5" />
                Study Material
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedModule && <StudyMaterialModal module={selectedModule} onClose={() => setSelectedModule(null)} />}
    </div>
  );
};

export default EducationModules;