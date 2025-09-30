import React, { useState, useCallback, useEffect } from 'react';
import { DisasterType, User, VideoStyle } from '../types';
import { DISASTER_MODULES, NIRF_COLLEGES } from '../constants';
import { PlayCircleIcon, ArrowUturnLeftIcon, ArrowPathIcon } from './icons/Icons';
import { generateVideoLesson } from '../services/geminiService';
import * as dbService from '../services/dbService';

interface VideoLessonsProps {
  user: User;
}

const VideoGenerationLoader: React.FC<{ disasterTitle: string }> = ({ disasterTitle }) => {
    const messages = [
        "Consulting with disaster experts...",
        "Simulating realistic scenarios...",
        "Rendering high-quality visuals...",
        "Crafting your custom safety lesson...",
        "This can take a few minutes, thank you for your patience.",
    ];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center p-8">
            <h1 className="text-4xl font-bold sm:text-5xl mb-4">Generating Your Video...</h1>
            <p className="text-lg text-[--brand-slate] mb-8">Please wait while our AI creates a personalized video lesson on <span className="font-bold text-[--brand-text] dark:text-white">{disasterTitle}</span>.</p>
            <div className="flex flex-col items-center justify-center">
                <ArrowPathIcon className="h-16 w-16 text-[--brand-purple] animate-spin" />
                <p className="text-xl font-semibold mt-6 animate-pulse">{message}</p>
            </div>
        </div>
    );
};


const VideoLessons: React.FC<VideoLessonsProps> = ({ user }) => {
    const [playingVideo, setPlayingVideo] = useState<{ title: string; url: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTitle, setLoadingTitle] = useState('');
    const [error, setError] = useState<string | null>(null);

    const getVideoStyle = useCallback((): VideoStyle => {
        return NIRF_COLLEGES.includes(user.institution) ? 'realistic' : 'cartoon';
    }, [user.institution]);

    const handleWatchVideo = async (disasterType: DisasterType, title: string) => {
        setError(null);
        setIsLoading(true);
        setLoadingTitle(title);
        
        const videoStyle = getVideoStyle();
        const videoKey = `${disasterType}-${videoStyle}`;

        try {
            const cachedVideo = await dbService.getVideo(videoKey);
            if (cachedVideo) {
                console.log("Loading video from cache...");
                const url = URL.createObjectURL(cachedVideo);
                setPlayingVideo({ title, url });
                setIsLoading(false);
                return;
            }

            console.log("Generating new video...");
            const videoBlob = await generateVideoLesson(disasterType, videoStyle);

            if (videoBlob) {
                await dbService.saveVideo(videoKey, videoBlob);
                console.log("Video saved to cache.");
                const url = URL.createObjectURL(videoBlob);
                setPlayingVideo({ title, url });
            } else {
                setError(`Sorry, we couldn't generate the video for ${title} at this time. Please try again later.`);
            }
        } catch (e) {
            console.error("Error in handleWatchVideo:", e);
            setError("An unexpected error occurred while preparing your video lesson.");
        } finally {
            setIsLoading(false);
            setLoadingTitle('');
        }
    };
    
    useEffect(() => {
        return () => {
            if (playingVideo?.url) {
                URL.revokeObjectURL(playingVideo.url);
            }
        };
    }, [playingVideo]);

    const lessonType = getVideoStyle() === 'cartoon' ? 'Animated' : 'Realistic';

    if (isLoading) {
        return <VideoGenerationLoader disasterTitle={loadingTitle} />;
    }

    if (playingVideo) {
        return (
            <div>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold sm:text-5xl">{lessonType} Lesson: {playingVideo.title}</h1>
                    <p className="mt-4 text-lg text-[--brand-slate]">Press play to learn!</p>
                </div>
                <div className="max-w-4xl mx-auto bg-black rounded-3xl soft-shadow overflow-hidden aspect-video">
                    <video src={playingVideo.url} controls autoPlay className="w-full h-full" />
                </div>
                <div className="text-center mt-8">
                    <button
                        onClick={() => setPlayingVideo(null)}
                        className="bg-[--brand-purple] text-white font-bold py-3 px-6 rounded-2xl hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <ArrowUturnLeftIcon className="h-5 w-5" />
                        Back to Lessons
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold sm:text-5xl">Video Lessons</h1>
                <p className="mt-4 text-lg text-[--brand-slate]">
                    Select a topic to generate a custom, AI-powered {getVideoStyle() === 'cartoon' ? 'animated cartoon' : 'realistic simulation'} lesson.
                </p>
            </div>
            
            {error && (
                <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 rounded-2xl text-center">
                    <p>{error}</p>
                </div>
            )}

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
                                onClick={() => handleWatchVideo(module.type, module.title)}
                                className="mt-auto w-full bg-[--brand-purple] hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <PlayCircleIcon className="h-5 w-5" />
                                Generate Lesson
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLessons;