// FIX: Corrected import statement for React and hooks (useState, useCallback).
import React, { useState, useCallback } from 'react';
import { DisasterType, User, VideoStyle } from '../types';
import { DISASTER_MODULES, NIRF_COLLEGES, PRE_GENERATED_VIDEOS } from '../constants';
import { PlayCircleIcon, ArrowUturnLeftIcon } from './icons/Icons';

interface VideoLessonsProps {
  user: User;
}

const VideoLessons: React.FC<VideoLessonsProps> = ({ user }) => {
    const [playingVideo, setPlayingVideo] = useState<{ title: string; url: string } | null>(null);

    const getVideoStyle = useCallback((): VideoStyle => {
        return NIRF_COLLEGES.includes(user.institution) ? 'realistic' : 'cartoon';
    }, [user.institution]);

    const handleWatchVideo = (disasterType: DisasterType, title: string) => {
        const videoStyle = getVideoStyle();
        const key = `${disasterType}-${videoStyle}`;
        const base64Data = PRE_GENERATED_VIDEOS[key];

        if (base64Data) {
            const url = `data:video/mp4;base64,${base64Data}`;
            setPlayingVideo({ title, url });
        } else {
            console.error(`Pre-generated video not found for key: ${key}`);
            // Optionally, handle this with a user-facing error message
        }
    };

    const lessonType = getVideoStyle() === 'cartoon' ? 'Animated' : 'Realistic';

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
                    Select a topic to watch a pre-generated, {getVideoStyle() === 'cartoon' ? 'animated cartoon' : 'realistic simulation'} lesson.
                </p>
            </div>
            
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
                                Watch Lesson
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoLessons;