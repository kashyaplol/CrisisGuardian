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
                    <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{lessonType} Lesson: {playingVideo.title}</h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Press play to learn!</p>
                </div>
                <div className="max-w-3xl mx-auto bg-slate-900 rounded-lg shadow-2xl overflow-hidden aspect-video">
                    <video src={playingVideo.url} controls autoPlay className="w-full h-full" />
                </div>
                <div className="text-center mt-8">
                    <button
                        onClick={() => setPlayingVideo(null)}
                        className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
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
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Video Lessons</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                    Select a topic to watch a pre-generated, {getVideoStyle() === 'cartoon' ? 'animated cartoon' : 'realistic simulation'} lesson.
                </p>
            </div>
            
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
                                onClick={() => handleWatchVideo(module.type, module.title)}
                                className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
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