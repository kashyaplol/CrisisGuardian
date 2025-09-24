import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserRole, View, DrillResult, Difficulty } from '../types';
import { UserCircleIcon, PencilIcon, CameraIcon, XCircleIcon, ShieldCheckIcon, AcademicCapIcon, BookOpenIcon, ArrowUturnLeftIcon, LogoutIcon, MapPinIcon } from './icons/Icons';
import { DEFAULT_AVATARS, DISASTER_MODULES, INDIAN_STATES } from '../constants';

interface ProfileProps {
  user: User;
  setUser: (user: User) => Promise<void>;
  setView: (view: View) => void;
  onLogout: () => void;
  region: string;
  setRegion: (region: string) => void;
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
          className="text-black/10 dark:text-white/10"
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
        <span className="text-lg text-[--brand-slate] dark:text-slate-400">/100</span>
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
            <div className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow w-full max-w-md p-6 relative animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-4 text-[--brand-charcoal] dark:text-white font-heading">
                    {showCamera ? 'Capture Photo' : 'Change Profile Picture'}
                </h3>
                <button onClick={onClose} className="absolute top-4 right-4 text-[--brand-slate] hover:text-[--brand-charcoal] dark:text-slate-400 dark:hover:text-white">
                    <XCircleIcon className="h-7 w-7" />
                </button>
                
                {showCamera ? (
                    <div>
                        <div className="relative bg-black rounded-2xl overflow-hidden mb-4 aspect-video">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                        {cameraError && <p className="text-red-500 text-sm text-center mb-4">{cameraError}</p>}
                        <div className="flex gap-4">
                            <button onClick={() => setShowCamera(false)} className="w-full flex items-center justify-center gap-2 bg-black/10 text-[--brand-charcoal] dark:bg-white/10 dark:text-white font-bold py-3 px-4 rounded-2xl hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                                <ArrowUturnLeftIcon className="h-5 w-5"/>
                                Back
                            </button>
                             <button onClick={handleCapture} disabled={!!cameraError} className="w-full flex items-center justify-center gap-2 bg-[--brand-orange] text-white font-bold py-3 px-4 rounded-2xl hover:bg-orange-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
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
                            className="w-full bg-[--brand-orange] text-white font-bold py-3 px-4 rounded-2xl hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <BookOpenIcon className="h-5 w-5" />
                            Upload from File
                        </button>
                         <button
                            onClick={() => setShowCamera(true)}
                            className="w-full bg-[--brand-charcoal] dark:bg-slate-200 text-white dark:text-[--brand-charcoal] font-bold py-3 px-4 rounded-2xl hover:bg-black/80 dark:hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <CameraIcon className="h-5 w-5" />
                            Use Camera
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-black/10 dark:border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-[--dark-surface] px-2 text-sm text-[--brand-slate] dark:text-slate-400">OR</span>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-[--brand-charcoal] dark:text-slate-300 mb-2">Select a default avatar:</p>
                            <div className="grid grid-cols-4 gap-4">
                                {DEFAULT_AVATARS.map(avatar => (
                                    <button 
                                        key={avatar.id} 
                                        onClick={() => onAvatarSelect(avatar.id)} 
                                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--brand-orange] dark:focus:ring-offset-[--dark-surface]"
                                    >
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
    const iconSrc = module?.icon;
  
    const difficultyColorClasses: Record<Difficulty, string> = {
      [Difficulty.Easy]: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
      [Difficulty.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
      [Difficulty.Hard]: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
    };
  
    return (
      <div className="flex items-center p-4 bg-black/5 dark:bg-white/10 rounded-2xl">
        <div className="flex-shrink-0 mr-4">
          {iconSrc ? (
            <img src={iconSrc} alt={result.disasterType} className="h-10 w-10" />
          ) : (
            <ShieldCheckIcon className="h-10 w-10 text-[--brand-slate] dark:text-slate-400" />
          )}
        </div>
        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-sm text-[--brand-slate] dark:text-slate-400">Disaster</p>
            <p className="font-semibold text-[--brand-charcoal] dark:text-slate-200">{result.disasterType}</p>
          </div>
          <div>
            <p className="text-sm text-[--brand-slate] dark:text-slate-400">Difficulty</p>
            <p className={`font-semibold text-sm inline-block px-2 py-0.5 rounded-full ${difficultyColorClasses[result.difficulty]}`}>{result.difficulty}</p>
          </div>
          <div>
            <p className="text-sm text-[--brand-slate] dark:text-slate-400">Score</p>
            <p className="font-semibold text-[--brand-charcoal] dark:text-slate-200">{result.score} / {result.totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm text-[--brand-slate] dark:text-slate-400">Date</p>
            <p className="font-semibold text-[--brand-charcoal] dark:text-slate-200">{new Date(result.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
};

const DrillHistorySkeleton: React.FC = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center p-4 bg-black/5 dark:bg-white/10 rounded-2xl animate-pulse">
                <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
                </div>
                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    {[...Array(4)].map((_, j) => (
                        <div key={j}>
                            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-1.5"></div>
                            <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);


const Profile: React.FC<ProfileProps> = ({ user, setUser, setView, onLogout, region, setRegion }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedRegion, setEditedRegion] = useState(region);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
      // Simulate fetching drill history to showcase the skeleton loader
      setIsLoadingHistory(true);
      const timer = setTimeout(() => {
          setIsLoadingHistory(false);
      }, 1200); // Simulate a network delay

      return () => clearTimeout(timer);
  }, [user.drillHistory]); // Re-trigger if history changes

  const handleEdit = () => {
    setEditedName(user.name);
    setEditedRegion(region);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };
  
  const handleSave = async () => {
    if (editedName.trim()) {
      await setUser({ ...user, name: editedName.trim() });
      setRegion(editedRegion);
    }
    setIsEditMode(false);
  };

  const handleAvatarUpdate = async (newAvatar: string) => {
    await setUser({ ...user, avatar: newAvatar });
    setIsModalOpen(false);
  };

  const scoreDescription = useMemo(() => {
    if (user.score >= 85) return "Excellent! You're well-prepared.";
    if (user.score >= 60) return "Good job! Keep learning to improve.";
    return "There's room for improvement. Keep practicing!";
  }, [user.score]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="relative bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-6 sm:p-8">
             <div className="absolute top-6 right-6 flex items-center gap-2 sm:gap-4">
                {isEditMode ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-xl bg-black/10 text-[--brand-charcoal] font-semibold hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors text-sm"
                        >
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 text-white bg-[--brand-orange] hover:bg-orange-600 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
                        aria-label="Edit Profile"
                    >
                        <PencilIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-[--brand-slate] dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Logout"
                >
                    <LogoutIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                <div className="relative group mb-4 md:mb-0 md:mr-8 flex-shrink-0">
                    <Avatar avatar={user.avatar} className="h-24 w-24 md:h-28 md:w-28 text-slate-300 dark:text-slate-600" />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300 cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="flex-grow pt-4">
                    <div className="mb-1">
                        {isEditMode ? (
                            <input 
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="w-full md:w-auto text-center md:text-left text-3xl md:text-4xl font-bold font-heading bg-black/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-orange] focus:ring-0 rounded-2xl transition-colors py-1 px-2"
                                autoFocus
                            />
                        ) : (
                             <h1 className="text-3xl md:text-4xl font-bold text-[--brand-charcoal] dark:text-white font-heading">{user.name}</h1>
                        )}
                    </div>
                    <p className="text-[--brand-slate] dark:text-slate-400 text-md font-medium">{user.role}</p>
                    <p className="text-[--brand-slate] dark:text-slate-400 text-sm">{user.email}</p>
                    {user.institution && (
                        <p className="text-[--brand-charcoal] dark:text-slate-300 text-md mt-2 font-medium flex items-center justify-center md:justify-start">
                            <AcademicCapIcon className="h-5 w-5 mr-2" />
                            {user.institution}
                        </p>
                    )}
                    <div className="mt-2 flex items-center justify-center md:justify-start">
                        <MapPinIcon className="h-5 w-5 mr-2 text-[--brand-slate] dark:text-slate-400" />
                        <select
                            value={isEditMode ? editedRegion : region}
                            onChange={(e) => isEditMode && setEditedRegion(e.target.value)}
                            disabled={!isEditMode}
                            className={`bg-transparent border-0 rounded-full py-1 text-md font-medium text-[--brand-charcoal] dark:text-slate-300 focus:ring-0 focus:ring-offset-0 focus:border-transparent font-heading ${!isEditMode ? 'cursor-not-allowed appearance-none' : ''}`}
                            aria-label="Select region"
                        >
                            {INDIAN_STATES.map((state) => (
                                <option key={state} value={state} className="bg-white dark:bg-[--dark-surface]">
                                {state}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <hr className="my-8 border-black/10 dark:border-white/10"/>

            <div>
                <h2 className="text-2xl font-bold text-[--brand-charcoal] dark:text-white font-heading mb-6 text-center">Your Preparedness Score</h2>
                <div className="flex flex-col items-center">
                    <ScoreGauge score={user.score}/>
                    <p className="mt-4 text-lg font-medium text-[--brand-slate] dark:text-slate-300">{scoreDescription}</p>
                     {user.role === UserRole.Admin && (
                        <div className="mt-6 text-center bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl w-full max-w-lg">
                            <p className="text-orange-800 dark:text-orange-300">
                                As an Admin, you can get a more detailed breakdown of campus-wide preparedness.
                            </p>
                             <button onClick={() => setView('dashboard')} className="mt-2 font-bold text-[--brand-orange] hover:underline">
                                Go to Admin Dashboard &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-8 border-black/10 dark:border-white/10"/>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[--brand-charcoal] dark:text-white font-heading mb-6 text-center">Drill History</h2>
              {isLoadingHistory ? (
                <DrillHistorySkeleton />
              ) : user.drillHistory && user.drillHistory.length > 0 ? (
                <div className="space-y-4">
                  {user.drillHistory
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((result) => (
                      <DrillHistoryItem key={result.id} result={result} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-black/5 dark:bg-white/10 rounded-2xl">
                  <p className="text-[--brand-slate] dark:text-slate-400">You haven't completed any drills yet.</p>
                  <button onClick={() => setView('drills')} className="mt-2 font-bold text-[--brand-orange] hover:underline">
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
