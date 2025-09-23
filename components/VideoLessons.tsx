import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DisasterType, User, VideoStyle } from '../types';
import { DISASTER_MODULES, NIRF_COLLEGES } from '../constants';
import * as geminiService from '../services/geminiService';
import { ArrowPathIcon, XCircleIcon, PlayCircleIcon, ArrowUturnLeftIcon } from './icons/Icons';

const cartoonLoadingMessages = [
    "Our AI is sketching out the characters...",
    "Animating key safety cartoons...",
    "Recording fun sound effects...",
    "Rendering the final animation, this can take a few minutes...",
    "Making the colors pop...",
    "Almost there, just adding the finishing touches...",
];

const realisticLoadingMessages = [
    "Analyzing advanced safety protocols...",
    "Simulating realistic disaster effects...",
    "Compiling complex procedural data...",
    "Rendering the high-fidelity simulation, this can take a few minutes...",
    "Optimizing video for clarity...",
    "Finalizing the training module...",
];

interface VideoLessonsProps {
  user: User;
}

const VideoLessons: React.FC<VideoLessonsProps> = ({ user }) => {
    const [view, setView] = useState<'selection' | 'generating' | 'playing'>('selection');
    const [selectedDisaster, setSelectedDisaster] = useState<DisasterType | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(cartoonLoadingMessages[0]);
    const videoUrlRef = useRef<string | null>(null);

    const getVideoStyle = useCallback((): VideoStyle => {
        if (user && NIRF_COLLEGES.includes(user.institution)) {
            return 'realistic';
        }
        return 'cartoon';
    }, [user]);

    useEffect(() => {
        let messageInterval: ReturnType<typeof setInterval>;
        if (view === 'generating') {
            const messages = getVideoStyle() === 'cartoon' ? cartoonLoadingMessages : realisticLoadingMessages;
            setCurrentLoadingMessage(messages[0]);

            messageInterval = setInterval(() => {
                setCurrentLoadingMessage(prev => {
                    const currentIndex = messages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % messages.length;
                    return messages[nextIndex];
                });
            }, 5000);
        }
        return () => {
            if (messageInterval) {
                clearInterval(messageInterval);
            }
        };
    }, [view, getVideoStyle]);

    // Cleanup object URL on unmount or when a new video is generated
    useEffect(() => {
        return () => {
            if (videoUrlRef.current) {
                URL.revokeObjectURL(videoUrlRef.current);
            }
        };
    }, []);

    const handleGenerateVideo = useCallback(async (disasterType: DisasterType) => {
        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }
        setVideoUrl(null);
        setError(null);
        setSelectedDisaster(disasterType);
        setView('generating');

        const videoStyle = getVideoStyle();
        
        try {
            const videoBlob = await geminiService.generateVideoLesson(disasterType, videoStyle);
            const objectUrl = URL.createObjectURL(videoBlob);
            videoUrlRef.current = objectUrl;
            setVideoUrl(objectUrl);
            setView('playing');
        } catch (err) {
            console.error("Video generation failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during video generation.");
            setView('selection'); // Go back to selection on error
        }
    }, [getVideoStyle]);

    const resetView = () => {
        setView('selection');
        setSelectedDisaster(null);
        setError(null);
        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }
        setVideoUrl(null);
    };
    
    const lessonType = getVideoStyle() === 'cartoon' ? 'Animated' : 'Realistic';

    if (view === 'generating') {
        return (
            <div className="text-center p-8 max-w-2xl mx-auto">
                <ArrowPathIcon className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Generating Your {lessonType} {selectedDisaster} Lesson...</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{currentLoadingMessage}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">This process can take several minutes. Please don't close this page.</p>
            </div>
        );
    }
    
    if (view === 'playing' && videoUrl) {
        return (
            <div>
                 <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">AI-Generated {lessonType} Lesson: {selectedDisaster}</h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Here is your custom video. Press play to learn!</p>
                </div>
                <div className="max-w-3xl mx-auto bg-slate-900 rounded-lg shadow-2xl overflow-hidden aspect-video">
                     <video src={videoUrl} controls autoPlay className="w-full h-full" />
                </div>
                 <div className="text-center mt-8">
                    <button
                        onClick={resetView}
                        className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                         <ArrowUturnLeftIcon className="h-5 w-5" />
                        Generate Another Video
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">AI-Generated Video Lessons</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                    Select a topic to generate a unique, {getVideoStyle() === 'cartoon' ? 'animated cartoon' : 'realistic simulation'} lesson powered by AI.
                </p>
            </div>
            
            {error && (
                <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-500/30 flex items-start gap-3">
                    <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-300">Generation Failed</h3>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {DISASTER_MODULES.map((module) => (
                <div key={module.type} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300">
                    <div className="p-6 bg-purple-500 text-white flex justify-center items-center">
                        <module.icon className="h-16 w-16" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2 dark:text-slate-100">{module.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-4">{module.description}</p>
                    <button
                        onClick={() => handleGenerateVideo(module.type)}
                        className="mt-auto w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                        <PlayCircleIcon className="h-5 w-5" />
                        Generate Video
                    </button>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLessons;