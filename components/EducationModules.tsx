import React, { useState } from 'react';
import { DisasterModule } from '../types';
import { DISASTER_MODULES } from '../constants';
import { XCircleIcon, CheckCircleIcon, BookOpenIcon } from './icons/Icons';
import AISafetyAdvisor from './AISafetyAdvisor';

const StudyMaterialModal: React.FC<{
  module: DisasterModule;
  onClose: () => void;
}> = ({ module, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-[--dark-surface] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-[--brand-charcoal] dark:text-white">{module.title}</h3>
                    <p className="text-[--brand-slate] dark:text-slate-400">Key Information & Safety Protocols</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                    <XCircleIcon className="h-7 w-7" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Context</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{module.studyMaterial.introduction}</p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-3 text-[--brand-charcoal] dark:text-slate-200">Key Safety Points</h4>
                    <div className="space-y-4">
                        {module.studyMaterial.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start">
                                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-[--brand-charcoal] dark:text-slate-200">{point.title}</h5>
                                    <p className="text-[--brand-slate] dark:text-slate-400">{point.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-black/5 dark:bg-white/10 border-t border-black/10 dark:border-white/10 flex justify-end">
                 <button 
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl bg-[--brand-orange] text-white font-semibold hover:bg-orange-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
        <AISafetyAdvisor context={module.type} />
    </div>
  );
};


const EducationModules: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<DisasterModule | null>(null);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[--brand-charcoal] sm:text-5xl dark:text-white">Disaster Study Modules</h1>
        <p className="mt-4 text-lg text-[--brand-slate] dark:text-slate-400">Choose a module to learn about specific disasters and enhance your preparedness knowledge.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DISASTER_MODULES.map((module) => (
          <div key={module.type} className="bg-white dark:bg-[--dark-surface] rounded-2xl soft-shadow soft-shadow-hover overflow-hidden flex flex-col">
            <div className="p-6 bg-blue-500 flex justify-center items-center h-32">
              <img src={module.icon} alt={module.title} className="h-16 w-16 filter brightness-0 invert" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{module.title}</h3>
              <p className="text-[--brand-slate] dark:text-slate-400 text-sm flex-grow mb-6">{module.description}</p>
              <button
                onClick={() => setSelectedModule(module)}
                className="mt-auto w-full bg-[--brand-charcoal] dark:bg-slate-200 text-white dark:text-[--brand-charcoal] font-bold py-3 px-4 rounded-xl hover:bg-black/80 dark:hover:bg-white/90 transition-colors duration-300 flex items-center justify-center gap-2"
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