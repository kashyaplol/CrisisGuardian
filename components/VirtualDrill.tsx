import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DisasterType, DrillStep, Difficulty, DrillStepOption, DrillMode } from '../types';
import { generateDrillScenario } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, ArrowPathIcon, ClockIcon, TrophyIcon } from './icons/Icons';

interface VirtualDrillProps {
  disasterType: DisasterType;
  region: string;
  difficulty: Difficulty;
  mode: DrillMode;
  onDrillComplete: (result: {
    disasterType: DisasterType;
    difficulty: Difficulty;
    mode: DrillMode;
    score?: number;
    totalQuestions?: number;
    stepsSurvived?: number;
  }) => void;
}

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <ArrowPathIcon className="h-12 w-12 text-[--brand-purple] animate-spin mb-4" />
        <p className="text-lg font-semibold">{message}</p>
        <p className="text-sm text-[--brand-slate] mt-2">Our AI is crafting a unique situation based on your selected region and disaster type. This may take a moment.</p>
    </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-3xl">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-red-700 dark:text-red-300">Failed to Generate Scenario</p>
        <p className="text-sm text-[--brand-slate] mt-2">There was an issue connecting to the AI service. Please check your connection and try again.</p>
        <button
            onClick={onRetry}
            className="mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-2xl hover:bg-red-700 transition-colors"
        >
            Retry
        </button>
    </div>
);

const VirtualDrill: React.FC<VirtualDrillProps> = ({ disasterType, region, difficulty, mode, onDrillComplete }) => {
  const [currentStep, setCurrentStep] = useState<DrillStep | null>(null);
  const [pastSteps, setPastSteps] = useState<DrillStep[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isDrillFinished, setIsDrillFinished] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Generating your first scenario...');
  const [isHintVisible, setIsHintVisible] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hasReportedCompletion, setHasReportedCompletion] = useState<boolean>(false);

  const isSurvival = mode === 'Survival';

  const totalSteps = useMemo(() => {
    if (isSurvival) return Infinity;
    switch (difficulty) {
        case Difficulty.Easy: return 1;
        case Difficulty.Medium: return 2;
        case Difficulty.Hard: return 3;
        default: return 1;
    }
  }, [difficulty, isSurvival]);
  
  // --- Timer Logic ---
  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval> | null = null;
    if (!isLoading && !isDrillFinished && currentStep) {
        timerInterval = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
    }
    return () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    };
  }, [isLoading, isDrillFinished, currentStep]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // --- Audio Setup ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
        if (ambientSourceRef.current) {
            (ambientSourceRef.current as any).stop?.();
            ambientSourceRef.current.disconnect();
        }
        audioContextRef.current?.close();
    };
  }, []);

  const playFeedbackSound = useCallback((isCorrect: boolean) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;
    audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
    if (isCorrect) {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    } else {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
    }
    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
  }, []);

  const stopAmbientSound = useCallback(() => {
    if (ambientSourceRef.current) {
      (ambientSourceRef.current as any).stop?.();
      ambientSourceRef.current.disconnect();
      ambientSourceRef.current = null;
    }
  }, []);

  const playAmbientSound = useCallback((disaster: DisasterType) => {
    stopAmbientSound();
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;
    audioCtx.resume();
    let source: AudioNode | null = null;
    const gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
    switch (disaster) {
      case DisasterType.Earthquake: {
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 40;
        gainNode.gain.value = 0.1;
        oscillator.connect(gainNode);
        oscillator.start();
        source = oscillator;
        break;
      }
      case DisasterType.Cyclone:
      case DisasterType.Flood: {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        const filter = audioCtx.createBiquadFilter();
        filter.type = disaster === DisasterType.Cyclone ? 'highpass' : 'lowpass';
        filter.frequency.value = disaster === DisasterType.Cyclone ? 1000 : 400;
        whiteNoise.connect(filter).connect(gainNode);
        gainNode.gain.value = disaster === DisasterType.Cyclone ? 0.05 : 0.1;
        whiteNoise.start();
        source = whiteNoise;
        break;
      }
      case DisasterType.Fire: {
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        const brownNoise = audioCtx.createBufferSource();
        brownNoise.buffer = buffer;
        brownNoise.loop = true;
        gainNode.gain.value = 0.2;
        brownNoise.connect(gainNode);
        brownNoise.start();
        source = brownNoise;
        break;
      }
    }
    ambientSourceRef.current = source;
  }, [stopAmbientSound]);

  const startDrill = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    setCurrentStep(null);
    setPastSteps([]);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setIsDrillFinished(false);
    setIsHintVisible(false);
    setElapsedTime(0);
    setHasReportedCompletion(false);
    setLoadingMessage(isSurvival ? 'Generating first survival scenario...' : `Generating scenario 1 of ${totalSteps}...`);
    
    playAmbientSound(disasterType);
    const scenario = await generateDrillScenario(disasterType, region, mode);
    
    if (scenario) {
      setCurrentStep(scenario);
    } else {
      setError(true);
      stopAmbientSound();
    }
    setIsLoading(false);
  }, [disasterType, region, mode, playAmbientSound, stopAmbientSound, totalSteps, isSurvival]);

  useEffect(() => {
    startDrill();
    return () => stopAmbientSound();
  }, [startDrill, stopAmbientSound]);
  
  const handleNextStep = useCallback(async (selectedOption: DrillStepOption) => {
    if (!currentStep) return;
    
    const currentStepIndex = pastSteps.length + 1;
    if (!isSurvival && currentStepIndex >= totalSteps) {
        setIsDrillFinished(true);
        stopAmbientSound();
        return;
    }

    setIsLoading(true);
    setLoadingMessage(isSurvival ? `Generating next survival scenario...` : `Generating scenario ${currentStepIndex + 1} of ${totalSteps}...`);
    setPastSteps(prev => [...prev, currentStep]);
    setCurrentStep(null); // Clear current step to show loader
    
    const previousStepContext = {
        scenario: currentStep.scenario,
        question: currentStep.question,
        userAnswer: selectedOption,
        stepsSurvived: isSurvival ? score + 1 : undefined,
    };
    
    const nextScenario = await generateDrillScenario(disasterType, region, mode, previousStepContext);
    
    if (nextScenario) {
        setCurrentStep(nextScenario);
        setSelectedOptionIndex(null);
        setIsAnswered(false);
        setIsHintVisible(false);
    } else {
        setError(true);
        stopAmbientSound();
    }
    setIsLoading(false);
  }, [currentStep, pastSteps, totalSteps, disasterType, region, stopAmbientSound, isSurvival, mode, score]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered || !currentStep) return;

    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const isCorrect = currentStep.options[index].isCorrect;
    playFeedbackSound(isCorrect);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setTimeout(() => handleNextStep(currentStep.options[index]), 3000);
    } else {
      if (isSurvival) {
        setTimeout(() => {
          setIsDrillFinished(true);
          stopAmbientSound();
        }, 3000);
      } else {
        setTimeout(() => handleNextStep(currentStep.options[index]), 3000);
      }
    }
  };
  
  useEffect(() => {
    if (isDrillFinished && !hasReportedCompletion) {
      if (isSurvival) {
        onDrillComplete({ disasterType, difficulty, mode, stepsSurvived: score });
      } else {
        onDrillComplete({ disasterType, difficulty, mode, score, totalQuestions: totalSteps });
      }
      setHasReportedCompletion(true);
    }
  }, [isDrillFinished, hasReportedCompletion, onDrillComplete, disasterType, difficulty, mode, score, totalSteps, isSurvival]);


  const getOptionClasses = (index: number) => {
    if (!isAnswered) {
      return "bg-white dark:bg-[--dark-surface] hover:bg-black/5 dark:hover:bg-white/10 soft-shadow soft-shadow-hover";
    }
    if (!currentStep) return "";
    const isSelected = selectedOptionIndex === index;
    const isCorrect = currentStep.options[index].isCorrect;

    if (isCorrect) return "bg-green-500/10 border-green-500 ring-2 ring-green-500 dark:bg-green-500/20";
    if (isSelected && !isCorrect) return "bg-red-500/10 border-red-500 ring-2 ring-red-500 dark:bg-red-500/20";
    
    return "bg-black/5 opacity-70 dark:bg-white/10";
  };

  const animationClass = useMemo(() => {
    if (isDrillFinished || isLoading || error) return '';
    switch (disasterType) {
        case DisasterType.Earthquake: return 'animate-shake';
        case DisasterType.Fire: return 'animate-fire';
        default: return '';
    }
  }, [disasterType, isDrillFinished, isLoading, error]);
  
  const progressPercentage = (pastSteps.length / totalSteps) * 100;

  if (isLoading && !currentStep) return <LoadingState message={loadingMessage} />;
  if (error) return <ErrorState onRetry={startDrill} />;
  
  if (isDrillFinished) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-lg font-semibold">Drill Complete!</p>
        <p className="text-sm text-[--brand-slate] mt-2">Calculating your results...</p>
    </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden">
        {!isDrillFinished && (
            <>
                {disasterType === DisasterType.Flood && <div className="flood-overlay"></div>}
                {disasterType === DisasterType.Cyclone && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="wind-line" style={{ top: '20%', animationDuration: '2s' }}></div>
                        <div className="wind-line" style={{ top: '40%', animationDuration: '3s', animationDelay: '0.5s', width: '100px' }}></div>
                        <div className="wind-line" style={{ top: '65%', animationDuration: '2.5s', animationDelay: '1.2s', width: '200px' }}></div>
                        <div className="wind-line" style={{ top: '80%', animationDuration: '2.8s', animationDelay: '0.8s' }}></div>
                    </div>
                )}
            </>
        )}

        <div className={`bg-white dark:bg-[--dark-surface] p-6 sm:p-8 rounded-3xl soft-shadow relative z-10 ${animationClass}`}>
            <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        <span className="text-[--brand-purple]">{disasterType} Drill {isSurvival && '(Survival)'}</span>
                    </h1>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center text-sm font-semibold text-[--brand-slate] bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            <span>{formatTime(elapsedTime)}</span>
                        </div>
                        {isSurvival ? (
                             <div className="flex items-center text-sm font-semibold text-[--brand-slate] bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">
                                <TrophyIcon className="h-4 w-4 mr-1.5 text-yellow-500" />
                                <span>{score} Survived</span>
                            </div>
                        ) : (
                            <div className="text-sm font-semibold text-[--brand-slate] bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">
                                Step {pastSteps.length + 1} of {totalSteps}
                            </div>
                        )}
                    </div>
                </div>
                {!isSurvival && (
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2" role="progressbar" aria-valuenow={pastSteps.length} aria-valuemin={0} aria-valuemax={totalSteps}>
                      <div 
                          className="bg-[--brand-purple] h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercentage}%` }}
                      ></div>
                  </div>
                )}
            </div>
            
            {!currentStep ? <LoadingState message={loadingMessage} /> : (
            <div>
                <div className="mb-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <div className="flex items-start text-purple-700 dark:text-purple-300 mb-2">
                        <SparklesIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-1"/>
                        <h3 className="text-lg font-semibold">Scenario</h3>
                    </div>
                    <p className="text-[--brand-slate] leading-relaxed">{currentStep.scenario}</p>
                </div>
                
                <div>
                    <p className="text-xl font-semibold mb-4">{currentStep.question}</p>
                    <div className="space-y-4">
                        {currentStep.options.map((option, index) => (
                            <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-2xl border border-black/10 dark:border-white/10 transition-all duration-300 flex items-start space-x-4 ${getOptionClasses(index)}`}
                            >
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{option.text}</p>
                                {isAnswered && selectedOptionIndex === index && (
                                <p className={`mt-2 text-sm font-semibold ${option.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {option.feedback}
                                </p>
                                )}
                            </div>
                            </button>
                        ))}
                    </div>

                     <div className="mt-6">
                        {isHintVisible ? (
                            <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 animate-chat-bubble-in">
                                <div className="flex items-start">
                                    <SparklesIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Hint</h4>
                                        <p className="text-[--brand-slate] mt-1">{currentStep.aiAdvice}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsHintVisible(true)}
                                disabled={isAnswered}
                                className="w-full bg-black/5 text-[--brand-text] font-bold py-3 px-4 rounded-2xl hover:bg-black/10 transition-colors duration-300 flex items-center justify-center gap-2 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="h-5 w-5" />
                                Get a Hint
                            </button>
                        )}
                    </div>
                </div>
            </div>
            )}
        </div>
    </div>
  );
};

export default VirtualDrill;