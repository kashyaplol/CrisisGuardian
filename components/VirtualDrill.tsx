import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DisasterType, DrillStep, Difficulty, DrillStepOption } from '../types';
import { generateDrillScenario } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, ArrowPathIcon, ClockIcon } from './icons/Icons';

interface VirtualDrillProps {
  disasterType: DisasterType;
  region: string;
  difficulty: Difficulty;
  onDrillComplete: (result: {
    disasterType: DisasterType;
    difficulty: Difficulty;
    score: number;
    totalQuestions: number;
  }) => void;
}

const LoadingState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
        <ArrowPathIcon className="h-12 w-12 text-[--brand-orange] animate-spin mb-4" />
        <p className="text-lg font-semibold text-[--brand-charcoal] dark:text-slate-300">{message}</p>
        <p className="text-sm text-[--brand-slate] dark:text-slate-400 mt-2">Our AI is crafting a unique situation based on your selected region and disaster type. This may take a moment.</p>
    </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-red-700 dark:text-red-300">Failed to Generate Scenario</p>
        <p className="text-sm text-[--brand-slate] dark:text-slate-400 mt-2">There was an issue connecting to the AI service. Please check your connection and try again.</p>
        <button
            onClick={onRetry}
            className="mt-4 bg-red-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-700 transition-colors"
        >
            Retry
        </button>
    </div>
);

const VirtualDrill: React.FC<VirtualDrillProps> = ({ disasterType, region, difficulty, onDrillComplete }) => {
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

  const totalSteps = useMemo(() => {
    switch (difficulty) {
        case Difficulty.Easy: return 1;
        case Difficulty.Medium: return 2;
        case Difficulty.Hard: return 3;
        default: return 1;
    }
  }, [difficulty]);
  
  // --- Timer Logic ---
  useEffect(() => {
    // FIX: Use ReturnType<typeof setInterval> for correct browser-based timer ID type.
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
    setLoadingMessage(`Generating scenario 1 of ${totalSteps}...`);
    
    playAmbientSound(disasterType);
    const scenario = await generateDrillScenario(disasterType, region);
    
    if (scenario) {
      setCurrentStep(scenario);
    } else {
      setError(true);
      stopAmbientSound();
    }
    setIsLoading(false);
  }, [disasterType, region, playAmbientSound, stopAmbientSound, totalSteps]);

  useEffect(() => {
    startDrill();
    return () => stopAmbientSound();
  }, [startDrill, stopAmbientSound]);
  
  const handleNextStep = useCallback(async (selectedOption: DrillStepOption) => {
    if (!currentStep) return;
    
    const currentStepIndex = pastSteps.length + 1;
    if (currentStepIndex >= totalSteps) {
        setIsDrillFinished(true);
        stopAmbientSound();
        return;
    }

    setIsLoading(true);
    setLoadingMessage(`Generating scenario ${currentStepIndex + 1} of ${totalSteps}...`);
    setPastSteps(prev => [...prev, currentStep]);
    setCurrentStep(null); // Clear current step to show loader
    
    const previousStepContext = {
        scenario: currentStep.scenario,
        question: currentStep.question,
        userAnswer: selectedOption
    };
    
    const nextScenario = await generateDrillScenario(disasterType, region, previousStepContext);
    
    if (nextScenario) {
        setCurrentStep(nextScenario);
        setSelectedOptionIndex(null);
        setIsAnswered(false);
        setIsHintVisible(false); // Hide hint for the new step
    } else {
        setError(true);
        stopAmbientSound();
    }
    setIsLoading(false);
  }, [currentStep, pastSteps, totalSteps, disasterType, region, stopAmbientSound]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered || !currentStep) return;

    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const isCorrect = currentStep.options[index].isCorrect;
    playFeedbackSound(isCorrect);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
        handleNextStep(currentStep.options[index]);
    }, 3000);
  };
  
  useEffect(() => {
    if (isDrillFinished && !hasReportedCompletion) {
      onDrillComplete({
        disasterType,
        difficulty,
        score,
        totalQuestions: totalSteps,
      });
      setHasReportedCompletion(true);
    }
  }, [isDrillFinished, hasReportedCompletion, onDrillComplete, disasterType, difficulty, score, totalSteps]);

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

  if (isLoading && !currentStep) return <LoadingState message={loadingMessage} />;
  if (error) return <ErrorState onRetry={startDrill} />;
  
  if(isDrillFinished) {
      const isPerfectScore = score === totalSteps;
      return (
          <div className="text-center p-8 bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 dark:text-white">Drill Complete!</h2>
              {isPerfectScore ? (
                  <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
              ) : (
                  <XCircleIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              )}
              <p className="text-2xl font-semibold dark:text-white">You scored {score} out of {totalSteps}</p>
              <p className="text-[--brand-slate] dark:text-slate-400 mt-2">Time Taken: {formatTime(elapsedTime)}</p>
              <p className="text-[--brand-slate] dark:text-slate-400 mt-2 mb-6">
                {isPerfectScore ? "Excellent work! You're a true CrisisGuardian." : "Good effort! Every drill is a learning opportunity."}
              </p>
              <button
                  onClick={startDrill}
                  className="bg-[--brand-orange] text-white font-bold py-3 px-6 rounded-2xl hover:bg-orange-600 transition-colors"
              >
                  Try Another Scenario
              </button>
          </div>
      )
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
            <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-6 flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-[--brand-charcoal] dark:text-white">
                    <span className="text-[--brand-orange]">{disasterType} Drill</span>
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center text-sm font-semibold text-[--brand-slate] dark:text-slate-400 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="text-sm font-semibold text-[--brand-slate] dark:text-slate-400 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                        Step {pastSteps.length + 1} of {totalSteps}
                    </div>
                </div>
            </div>
            
            {!currentStep ? <LoadingState message={loadingMessage} /> : (
            <div>
                <div className="mb-6 p-4 bg-black/5 rounded-2xl border border-black/5 dark:bg-white/10 dark:border-white/10">
                    <div className="flex items-start text-blue-700 dark:text-blue-300 mb-2">
                        <SparklesIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-1"/>
                        <h3 className="text-lg font-semibold">Scenario</h3>
                    </div>
                    <p className="text-[--brand-slate] dark:text-slate-300 leading-relaxed">{currentStep.scenario}</p>
                </div>
                
                <div>
                    <p className="text-xl font-semibold text-[--brand-charcoal] dark:text-slate-200 mb-4">{currentStep.question}</p>
                    <div className="space-y-4">
                        {currentStep.options.map((option, index) => (
                            <button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-2xl border border-black/10 dark:border-white/10 transition-all duration-300 flex items-start space-x-4 ${getOptionClasses(index)}`}
                            >
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center font-bold text-[--brand-charcoal] dark:text-slate-200">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-[--brand-charcoal] dark:text-slate-200">{option.text}</p>
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
                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 animate-chat-bubble-in">
                                <div className="flex items-start">
                                    <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Hint</h4>
                                        <p className="text-[--brand-slate] dark:text-slate-300 mt-1">{currentStep.aiAdvice}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsHintVisible(true)}
                                disabled={isAnswered}
                                className="w-full bg-black/5 text-[--brand-charcoal] font-bold py-3 px-4 rounded-xl hover:bg-black/10 transition-colors duration-300 flex items-center justify-center gap-2 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
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