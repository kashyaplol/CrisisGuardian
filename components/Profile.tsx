import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserRole, View, DrillResult, Difficulty, AchievementId } from '../types';
import { UserCircleIcon, PencilIcon, CameraIcon, XCircleIcon, ShieldCheckIcon, AcademicCapIcon, BookOpenIcon, ArrowUturnLeftIcon, LogoutIcon, MapPinIcon, FireIcon, TrophyIcon } from './icons/Icons';
import { DEFAULT_AVATARS, INDIAN_STATES, ACHIEVEMENTS_LIST } from '../constants';
import { getXpForLevel } from '../services/progressionService';

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

const XpProgress: React.FC<{ user: User }> = ({ user }) => {
    const level = Number.isFinite(user.level) ? user.level : 1;
    const xp = Number.isFinite(user.xp) ? user.xp : 0;
    const xpForCurrentLevel = getXpForLevel(level);
    const xpForNextLevel = getXpForLevel(level + 1);
    const levelXp = xpForNextLevel - xpForCurrentLevel;
    const currentLevelProgress = xp - xpForCurrentLevel;
    const progressPercentage = Math.max(0, Math.min(100, (currentLevelProgress / levelXp) * 100));

    return (
        <div className="w-full">
            <div className="flex justify-between items-baseline mb-1">
                <p className="text-xl font-bold">Level {level}</p>
                <p className="text-sm font-medium text-[--brand-slate]">{xp} / {xpForNextLevel} XP</p>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5">
                <div 
                    className="bg-[--brand-purple] h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
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
                <h3 className="text-xl font-semibold mb-4 font-heading">
                    {showCamera ? 'Capture Photo' : 'Change Profile Picture'}
                </h3>
                <button onClick={onClose} className="absolute top-4 right-4 text-[--brand-slate] hover:text-[--brand-text] dark:text-slate-400 dark:hover:text-white">
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
                            <button onClick={() => setShowCamera(false)} className="w-full flex items-center justify-center gap-2 bg-black/10 text-[--brand-text] dark:bg-white/10 dark:text-white font-bold py-3 px-4 rounded-2xl hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                                <ArrowUturnLeftIcon className="h-5 w-5"/>
                                Back
                            </button>
                             <button onClick={handleCapture} disabled={!!cameraError} className="w-full flex items-center justify-center gap-2 bg-[--brand-purple] text-white font-bold py-3 px-4 rounded-2xl hover:bg-purple-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
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
                            className="w-full bg-[--brand-purple] text-white font-bold py-3 px-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <BookOpenIcon className="h-5 w-5" />
                            Upload from File
                        </button>
                         <button
                            onClick={() => setShowCamera(true)}
                            className="w-full bg-[--brand-light-purple] dark:bg-purple-500/30 text-[--brand-text] dark:text-white font-bold py-3 px-4 rounded-2xl hover:bg-purple-200 dark:hover:bg-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <CameraIcon className="h-5 w-5" />
                            Use Camera
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-black/10 dark:border-white/10" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-[--dark-surface] px-2 text-sm text-[--brand-slate]">OR</span>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-[--brand-text] dark:text-slate-300 mb-2">Select a default avatar:</p>
                            <div className="grid grid-cols-4 gap-4">
                                {DEFAULT_AVATARS.map(avatar => (
                                    <button 
                                        key={avatar.id} 
                                        onClick={() => onAvatarSelect(avatar.id)} 
                                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--brand-purple] dark:focus:ring-offset-[--dark-surface]"
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

const Profile: React.FC<ProfileProps> = ({ user, setUser, setView, onLogout, region, setRegion }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedRegion, setEditedRegion] = useState(region);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  
  const userAchievements = useMemo(() => new Set(user.unlockedAchievements.map(a => a.achievementId)), [user.unlockedAchievements]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-6 sm:p-8">
             <div className="absolute top-6 right-6 flex items-center gap-2 sm:gap-4">
                {isEditMode ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-2xl bg-black/10 text-[--brand-text] font-semibold hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors text-sm"
                        >
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 text-white bg-[--brand-purple] hover:bg-purple-700 font-semibold text-sm px-4 py-2 rounded-full transition-colors"
                        aria-label="Edit Profile"
                    >
                        <PencilIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                )}
                <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-[--brand-slate] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
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
                                className="w-full md:w-auto text-center md:text-left text-3xl md:text-4xl font-bold font-heading bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors py-1 px-2"
                                autoFocus
                            />
                        ) : (
                             <h1 className="text-3xl md:text-4xl font-bold font-heading">{user.name}</h1>
                        )}
                    </div>
                    <p className="text-[--brand-slate] text-md font-medium">{user.role}</p>
                    <p className="text-[--brand-slate] text-sm">{user.email}</p>
                    {user.institution && (
                        <p className="text-[--brand-text] dark:text-slate-300 text-md mt-2 font-medium flex items-center justify-center md:justify-start">
                            <AcademicCapIcon className="h-5 w-5 mr-2" />
                            {user.institution}
                        </p>
                    )}
                    <div className="mt-2 flex items-center justify-center md:justify-start">
                        <MapPinIcon className="h-5 w-5 mr-2 text-[--brand-slate]" />
                        <select
                            value={isEditMode ? editedRegion : region}
                            onChange={(e) => isEditMode && setEditedRegion(e.target.value)}
                            disabled={!isEditMode}
                            className={`bg-transparent border-0 rounded-full py-1 text-md font-medium focus:ring-0 focus:ring-offset-0 focus:border-transparent font-heading ${!isEditMode ? 'cursor-not-allowed appearance-none' : ''}`}
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
        </div>

        <div className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-6 sm:p-8">
            <div className="space-y-6">
                <XpProgress user={user} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="flex items-center gap-4 bg-purple-500/10 dark:bg-purple-500/20 p-4 rounded-2xl">
                        <TrophyIcon className="h-10 w-10 text-[--brand-purple]"/>
                        <div>
                            <p className="text-2xl font-bold">{user.trophies || 0}</p>
                            <p className="text-[--brand-slate] text-sm">Trophies Earned</p>
                        </div>
                    </div>
                    {user.streak.count > 0 && (
                        <div className="flex items-center gap-4 bg-yellow-500/10 dark:bg-yellow-500/20 p-4 rounded-2xl">
                            <FireIcon className="h-10 w-10 text-yellow-500"/>
                            <div>
                                <p className="text-2xl font-bold">{user.streak.count}-Day Streak</p>
                                <p className="text-[--brand-slate] text-sm">Keep it going!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-6 sm:p-8">
            <h2 className="text-2xl font-bold font-heading mb-6 text-center">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {ACHIEVEMENTS_LIST.map(ach => {
                    const isUnlocked = userAchievements.has(ach.id);
                    const unlockedData = isUnlocked ? user.unlockedAchievements.find(ua => ua.achievementId === ach.id) : null;

                    return (
                        <div key={ach.id} className={`text-center p-4 rounded-2xl ${isUnlocked ? 'bg-yellow-500/10 dark:bg-yellow-500/20' : 'bg-black/5 dark:bg-white/10'}`}>
                            <ach.icon className={`h-16 w-16 mx-auto mb-3 ${!isUnlocked && 'filter grayscale opacity-40'}`} />
                            <h3 className="font-bold text-sm">{ach.name}</h3>
                            <p className="text-xs text-[--brand-slate] mt-1">{ach.description}</p>
                            {unlockedData && <p className="text-xs text-[--brand-slate] mt-2">Unlocked: {new Date(unlockedData.dateUnlocked).toLocaleDateString()}</p>}
                        </div>
                    );
                })}
            </div>
        </div>

        {isModalOpen && <AvatarModal onClose={() => setIsModalOpen(false)} onAvatarSelect={handleAvatarUpdate} />}
    </div>
  );
};

export default Profile;
