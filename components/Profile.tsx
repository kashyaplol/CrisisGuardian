import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserRole, View, DrillResult, Difficulty } from '../types';
import { UserCircleIcon, PencilIcon, CameraIcon, XCircleIcon, ShieldCheckIcon, AcademicCapIcon, BookOpenIcon, ArrowUturnLeftIcon } from './icons/Icons';
import { DEFAULT_AVATARS, DISASTER_MODULES } from '../constants';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
  setView: (view: View) => void;
}

const Avatar: React.FC<{ avatar: string; className?: string }> = ({ avatar, className }) => {
  if (avatar.startsWith('data:image/')) {
      return <img src={avatar} alt="User Avatar" className={`rounded-full object-cover ${className}`} />;
  }
  const DefaultAvatar = DEFAULT_AVATARS.find(a => a.id === avatar)?.Icon;
  return DefaultAvatar ? <DefaultAvatar className={`rounded-full ${className}`} /> : <UserCircleIcon className={className} />;
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const offset = circumference - (score / 100) * circumference;

  const colorClass = useMemo(() => {
    if (score >= 85) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  }, [score]);

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className={`absolute text-3xl font-bold ${colorClass}`}>
        {score}
        <span className="text-lg text-slate-500 dark:text-slate-400">/100</span>
      </div>
    </div>
  );
};

const AvatarModal: React.FC<{
    onClose: () => void;
    onAvatarSelect: (avatar: string) => void;
}> = ({ onClose, onAvatarSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async () => {
        stopCamera();
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError("Could not access camera. Please check permissions and try again.");
        }
    };

    useEffect(() => {
        if (showCamera) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [showCamera]);
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onAvatarSelect(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            onAvatarSelect(dataUrl);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-4 dark:text-slate-100">
                    {showCamera ? 'Capture Photo' : 'Change Profile Picture'}
                </h3>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
                    <XCircleIcon className="h-7 w-7" />
                </button>
                
                {showCamera ? (
                    <div>
                        <div className="relative bg-slate-900 rounded-lg overflow-hidden mb-4 aspect-video">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        {cameraError && <p className="text-red-500 text-sm text-center mb-4">{cameraError}</p>}
                        <div className="flex gap-4">
                            <button onClick={() => setShowCamera(false)} className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
                                <ArrowUturnLeftIcon className="h-5 w-5"/>
                                Back
                            </button>
                             <button onClick={handleCapture} disabled={!!cameraError} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                                <CameraIcon className="h-5 w-5" />
                                Capture
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <BookOpenIcon className="h-5 w-5" />
                            Upload from File
                        </button>
                         <button
                            onClick={() => setShowCamera(true)}
                            className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CameraIcon className="h-5 w-5" />
                            Use Camera
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-slate-800 px-2 text-sm text-slate-500 dark:text-slate-400">OR</span>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select a default avatar:</p>
                            <div className="grid grid-cols-4 gap-4">
                                {DEFAULT_AVATARS.map(avatar => (
                                    <button key={avatar.id} onClick={() => onAvatarSelect(avatar.id)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <avatar.Icon className="w-16 h-16" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DrillHistoryItem: React.FC<{ result: DrillResult }> = ({ result }) => {
    const module = DISASTER_MODULES.find(m => m.type === result.disasterType);
    const Icon = module?.icon || ShieldCheckIcon;
  
    const difficultyColorClasses: Record<Difficulty, string> = {
      [Difficulty.Easy]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      [Difficulty.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      [Difficulty.Hard]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
  
    return (
      <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex-shrink-0 mr-4">
          <Icon className="h-10 w-10 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Disaster</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{result.disasterType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Difficulty</p>
            <p className={`font-semibold text-sm inline-block px-2 py-0.5 rounded-full ${difficultyColorClasses[result.difficulty]}`}>{result.difficulty}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{result.score} / {result.totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{new Date(result.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

const Profile: React.FC<ProfileProps> = ({ user, setUser, setView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      setUser({ ...user, name: name.trim() });
      setIsEditing(false);
    }
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    setUser({ ...user, avatar: newAvatar });
    setIsModalOpen(false);
  };

  const scoreDescription = useMemo(() => {
    if (user.score >= 85) return "Excellent! You're well-prepared.";
    if (user.score >= 60) return "Good job! Keep learning to improve.";
    return "There's room for improvement. Keep practicing!";
  }, [user.score]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                <div className="relative group mb-4 md:mb-0 md:mr-8 flex-shrink-0">
                    <Avatar avatar={user.avatar} className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="flex-grow">
                    <div className="flex items-center justify-center md:justify-start mb-1">
                        {isEditing ? (
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-3xl font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none dark:bg-transparent dark:text-slate-100 dark:border-blue-400"
                                autoFocus
                            />
                        ) : (
                             <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h1>
                        )}
                       
                        {isEditing ? (
                             <button onClick={handleSave} className="ml-4 text-sm bg-blue-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-700">
                                Save
                             </button>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="ml-4 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" aria-label="Edit name">
                                <PencilIcon className="h-5 w-5"/>
                            </button>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-md font-medium">{user.role}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                    {user.institution && (
                        <p className="text-slate-600 dark:text-slate-300 text-md mt-2 font-medium flex items-center justify-center md:justify-start">
                            <AcademicCapIcon className="h-5 w-5 mr-2" />
                            {user.institution}
                        </p>
                    )}
                </div>
            </div>

            <hr className="my-8 dark:border-slate-700"/>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Your Preparedness Score</h2>
                <div className="flex flex-col items-center">
                    <ScoreGauge score={user.score}/>
                    <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">{scoreDescription}</p>
                     {user.role === UserRole.Admin && (
                        <div className="mt-6 text-center bg-blue-50 border border-blue-200 p-4 rounded-lg dark:bg-blue-900/20 dark:border-blue-500/30">
                            <p className="text-blue-800 dark:text-blue-300">
                                As an Admin, you can get a more detailed breakdown of campus-wide preparedness.
                            </p>
                             <button onClick={() => setView('dashboard')} className="mt-2 font-semibold text-blue-600 hover:underline dark:text-blue-400">
                                Go to Admin Dashboard &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-8 dark:border-slate-700"/>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Drill History</h2>
              {user.drillHistory && user.drillHistory.length > 0 ? (
                <div className="space-y-4">
                  {user.drillHistory
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((result) => (
                      <DrillHistoryItem key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-slate-600 dark:text-slate-400">You haven't completed any drills yet.</p>
                  <button onClick={() => setView('drills')} className="mt-2 font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Start a drill to see your history here!
                  </button>
                </div>
              )}
            </div>
        </div>
        {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarSelect={handleAvatarUpdate} />}
    </div>
  );
};

export default Profile;
