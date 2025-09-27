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
        case Difficulty.Easy: return 4;
        case Difficulty.Medium: return 7;
        case Difficulty.Hard: return 10;
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

        <div className={`bg-white/80 dark:bg-[--dark-surface]/80 backdrop-blur-md rounded-3xl soft-shadow p-6 sm:p-8 relative z-10 transition-transform duration-500 ${animationClass}`}>
          {currentStep && (
            <>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                        {isSurvival ? (
                            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full">
                                <TrophyIcon className="h-4 w-4" />
                                <span>Steps Survived: {score}</span>
                            </div>
                        ) : (
                             <span className="text-[--brand-slate]">Step {pastSteps.length + 1} of {totalSteps}</span>
                        )}
                        <div className="flex items-center gap-2 text-[--brand-slate]">
                            <ClockIcon className="h-5 w-5" />
                            <span>{formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                    {!isSurvival && (
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                            <div className="bg-[--brand-purple] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    )}
                </div>
                
                <div className="bg-purple-500/5 dark:bg-white/5 p-4 sm:p-6 rounded-2xl mb-6 border border-purple-500/10">
                    <p className="text-base sm:text-lg leading-relaxed text-[--brand-slate] animate-chat-bubble-in">{currentStep.scenario}</p>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-6 font-heading">{currentStep.question}</h2>

                <div className="grid grid-cols-1 gap-4">
                    {currentStep.options.map((option, index) => (
                        <div key={index} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                            <button
                                onClick={() => handleOptionSelect(index)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-start ${getOptionClasses(index)} ${!isAnswered ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            >
                                <span className="text-lg font-bold mr-4 text-[--brand-purple]">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="flex-1 font-semibold">{option.text}</span>
                                {isAnswered && (
                                    <span className="ml-4">
                                        {option.isCorrect ? <CheckCircleIcon className="h-6 w-6 text-green-500" /> : <XCircleIcon className="h-6 w-6 text-red-500" />}
                                    </span>
                                )}
                            </button>
                             {isAnswered && (
                                <p className={`mt-2 text-sm px-5 transition-all duration-500 overflow-hidden ${selectedOptionIndex === index || option.isCorrect ? 'max-h-40' : 'max-h-0'}`}>
                                    {option.feedback}
                                </p>
                             )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => setIsHintVisible(!isHintVisible)}
                        className="flex items-center gap-2 mx-auto text-sm font-semibold text-[--brand-purple] hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                    >
                        <SparklesIcon className="h-5 w-5"/>
                        Need a hint?
                    </button>
                    {isHintVisible && (
                        <div className="mt-4 p-4 bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 rounded-2xl animate-fade-in-up">
                            <p className="font-semibold">AI Advisor says:</p>
                            <p>{currentStep.aiAdvice}</p>
                        </div>
                    )}
                </div>
            </>
          )}
        </div>
    </div>
  );
};

export default VirtualDrill;
