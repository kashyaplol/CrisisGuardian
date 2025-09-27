import React, { useEffect, useState } from 'react';
import { ProgressionSummary, User } from '../types';
import { getXpForLevel } from '../services/progressionService';
import { FireIcon, XCircleIcon, TrophyIcon } from './icons/Icons';

interface PostActivitySummaryProps {
  summary: ProgressionSummary;
  user: User;
  onClose: () => void;
}

const AnimatedXpBar: React.FC<{
    oldXp: number;
    newXp: number;
    level: number;
}> = ({ oldXp, newXp, level }) => {
    const [progress, setProgress] = useState(0);

    const xpForCurrentLevel = getXpForLevel(level);
    const xpForNextLevel = getXpForLevel(level + 1);
    const levelXp = xpForNextLevel - xpForCurrentLevel;
    
    const oldLevelProgress = oldXp - xpForCurrentLevel;
    const oldPercentage = Math.max(0, Math.min(100, (oldLevelProgress / levelXp) * 100));

    const newLevelProgress = newXp - xpForCurrentLevel;
    const newPercentage = Math.max(0, Math.min(100, (newLevelProgress / levelXp) * 100));

    useEffect(() => {
        setProgress(oldPercentage);
        const timer = setTimeout(() => {
            setProgress(newPercentage);
        }, 300); // Small delay to start the animation
        return () => clearTimeout(timer);
    }, [oldPercentage, newPercentage]);

    return (
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-4 relative">
            <div 
                className="bg-[--brand-purple] h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {Math.round(newXp)} / {xpForNextLevel} XP
            </span>
        </div>
    );
};


const PostActivitySummary: React.FC<PostActivitySummaryProps> = ({ summary, user, onClose }) => {
  const { xpGained, leveledUp, newLevel, oldXp, newXp, newlyUnlocked, streakUpdated, newStreak, mode, score, totalQuestions, stepsSurvived } = summary;
  const isSurvival = mode === 'Survival';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <div className="bg-white dark:bg-[--dark-surface] rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold">Drill Complete!</h3>
                    <p className="text-[--brand-slate]">Here's your progress summary.</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-[--brand-text] dark:text-slate-400 dark:hover:text-slate-100">
                    <XCircleIcon className="h-7 w-7" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">

                {/* Main Score/Result */}
                {isSurvival ? (
                    <div className="text-center p-6 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl">
                        <TrophyIcon className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                        <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-200">Survival Mode</p>
                        <p className="text-5xl font-bold">{stepsSurvived}</p>
                        <p className="font-semibold text-[--brand-slate]">Steps Survived</p>
                    </div>
                ) : (
                    <div className="text-center p-6 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl">
                         <p className="text-lg font-semibold text-purple-700 dark:text-purple-200">Score</p>
                         <p className="text-5xl font-bold">{score} <span className="text-3xl text-[--brand-slate]">/ {totalQuestions}</span></p>
                         <p className="font-semibold text-[--brand-slate]">Correct Answers</p>
                    </div>
                )}


                {/* XP and Level Up */}
                <div className="text-center p-6 bg-black/5 dark:bg-white/5 rounded-2xl">
                    {leveledUp && (
                        <div className="mb-4 text-2xl font-bold text-green-500 animate-pulse">
                            LEVEL UP!
                        </div>
                    )}
                    <p className="text-4xl font-bold text-[--brand-purple]">+{xpGained} XP</p>
                    <div className="mt-4">
                        <AnimatedXpBar oldXp={oldXp} newXp={newXp} level={newLevel} />
                    </div>
                </div>

                {/* Streak Update */}
                {streakUpdated && newStreak > 0 && (
                     <div className="flex items-center gap-4 bg-yellow-500/10 dark:bg-yellow-500/20 p-4 rounded-2xl">
                        <FireIcon className="h-10 w-10 text-[--brand-yellow]"/>
                        <div>
                            <p className="text-xl font-bold">{newStreak}-Day Streak</p>
                            <p className="text-[--brand-slate] text-sm">
                                {newStreak > 1 ? `You've kept your streak alive!` : 'You started a new streak!'}
                            </p>
                        </div>
                    </div>
                )}

                {/* New Achievements */}
                {newlyUnlocked.length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-center">Achievements Unlocked!</h4>
                        <div className="space-y-3">
                            {newlyUnlocked.map(ach => (
                                <div key={ach.id} className="flex items-center p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl border-2 border-yellow-500/20">
                                    <ach.icon className="h-12 w-12 mr-4" />
                                    <div>
                                        <h5 className="font-bold">{ach.name}</h5>
                                        <p className="text-sm text-[--brand-slate]">{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex justify-end">
                 <button 
                    onClick={onClose}
                    className="px-8 py-3 rounded-2xl bg-[--brand-purple] text-white font-semibold hover:bg-purple-700 transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    </div>
  );
};

export default PostActivitySummary;