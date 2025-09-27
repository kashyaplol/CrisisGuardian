import React, { useState, useCallback, useMemo } from 'react';
import { generateSafetyTips } from '../services/geminiService';
import { SparklesIcon, XCircleIcon, ArrowPathIcon } from './icons/Icons';

interface AISafetyAdvisorProps {
  context: string;
}

const AISafetyAdvisor: React.FC<AISafetyAdvisorProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTips = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setTips([]);

    const result = await generateSafetyTips(context);
    
    if (result) {
      setTips(result.split('\n').filter(tip => tip.trim() !== ''));
    } else {
      setError('Could not fetch safety tips at this time. Please try again later.');
    }
    
    setIsLoading(false);
  }, [context, isLoading]);

  const handleButtonClick = () => {
    setIsOpen(true);
    // Fetch tips only if we haven't fetched them before for this context, or if there was an error
    if (tips.length === 0 || error) {
      fetchTips();
    }
  };

  const advisorTitle = useMemo(() => {
    switch(context) {
        case 'home': return "General Preparedness";
        case 'modules': return "Effective Learning";
        case 'drills': return "Drill Preparation";
        default: return `${context} Safety`;
    }
  }, [context]);

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-[--brand-purple] rounded-full text-white soft-shadow soft-shadow-hover flex items-center justify-center"
        aria-label="Get AI Safety Tips"
      >
        <SparklesIcon className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="bg-white dark:bg-[--dark-surface] rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <SparklesIcon className="h-6 w-6 text-[--brand-purple]" />
                  <h3 className="text-xl font-bold font-heading">AI Advisor: {advisorTitle}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-[--brand-text] dark:text-slate-400 dark:hover:text-slate-100">
                <XCircleIcon className="h-7 w-7" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto min-h-[150px]">
              {isLoading && (
                <div className="flex flex-col items-center justify-center text-center text-[--brand-slate]">
                  <ArrowPathIcon className="h-10 w-10 animate-spin text-[--brand-purple] mb-4" />
                  <p className="font-semibold">Generating tips for you...</p>
                </div>
              )}
              {error && (
                <div className="text-center text-red-600 dark:text-red-400">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && !error && (
                <ul className="space-y-4">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-xl mr-3 -mt-1">{tip.match(/^\p{Emoji}/u)?.[0] || '🔹'}</span>
                      <p className="flex-1 text-[--brand-slate]">{tip.replace(/^\p{Emoji}\s*/u, '')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex justify-end gap-3">
              <button 
                onClick={fetchTips}
                disabled={isLoading}
                className="px-4 py-2 rounded-2xl bg-black/10 text-[--brand-text] font-semibold hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 rounded-2xl bg-[--brand-purple] text-white font-semibold hover:bg-purple-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISafetyAdvisor;