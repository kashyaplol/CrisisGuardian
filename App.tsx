import React, { useState, useCallback, useEffect } from 'react';
import { DisasterType, View, User, UserRole, Theme, Difficulty, DrillResult, ProgressionSummary, DrillMode } from './types';
import Header from './components/Header';
import Home from './components/Home';
import EducationModules from './components/EducationModules';
import DrillsLobby from './components/DrillsLobby';
import VirtualDrill from './components/VirtualDrill';
import AdminDashboard from './components/AdminDashboard';
import EmergencyContacts from './components/EmergencyContacts';
import Login from './components/Login';
import Signup from './components/Signup';
import VerifyOtp from './components/VerifyOtp';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import RegisterInstitution from './components/RegisterInstitution';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VideoLessons from './components/VideoLessons';
import PostActivitySummary from './components/PostActivitySummary';
import { DEFAULT_AVATARS } from './constants';
import * as authService from './services/authService';
import * as analyticsService from './services/analyticsService';
import * as progressionService from './services/progressionService';

// Define a type for the temporary authentication information
type AuthInfo = {
  flow: 'signup' | 'forgotPassword';
  email: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  institution?: string;
  password?: string;
  otpHint?: string;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [selectedRegion, setSelectedRegion] = useState<string>('Delhi');
  const [selectedMode, setSelectedMode] = useState<DrillMode>('Standard');

  const [lastDrillResult, setLastDrillResult] = useState<ProgressionSummary | null>(null);
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as Theme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
        await authService.seedInitialUsers();
        const loggedInUser = await authService.checkSession();
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
            setCurrentView('home');
        }
        setIsLoading(false);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
    return () => {
        document.body.classList.remove('no-scroll');
    };
  }, [isSidebarOpen]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = await authService.loginUser(email, password);
    if (user) {
      await authService.createSession(user);
      setCurrentUser(user);
      setCurrentView('home');
      return true;
    }
    return false;
  }, []);

  const handleStartSignup = useCallback((details: {
    name: string,
    email: string,
    phone?: string,
    role: UserRole,
    institution: string,
    password?: string
  }) => {
    const otpHint = authService.sendOtp(details.email);
    setAuthInfo({ flow: 'signup', ...details, otpHint });
    setCurrentView('verifyOtp');
  }, []);

  const handleStartForgotPassword = useCallback(async (email: string): Promise<boolean> => {
      const userExists = await authService.findUserByEmail(email);
      if (userExists) {
          const otpHint = authService.sendOtp(email);
          setAuthInfo({ flow: 'forgotPassword', email, otpHint });
          setCurrentView('verifyOtp');
          return true;
      }
      return false; // User does not exist, but we won't reveal this to the user for security.
  }, []);

  const handleResetPassword = useCallback(async (password: string): Promise<void> => {
      if (authInfo?.flow === 'forgotPassword') {
          await authService.updatePassword(authInfo.email, password);
          setAuthInfo(null);
          setCurrentView('login');
      }
  }, [authInfo]);

  const handleOtpVerified = useCallback(async (email: string) => {
    const { flow } = authInfo || {};

    if (flow === 'signup') {
        if (authInfo?.name && authInfo?.role && authInfo?.institution && authInfo?.password) {
            // Normal signup path for a new user
            const newUser: User = {
                name: authInfo.name,
                email: authInfo.email,
                phone: authInfo.phone,
                role: authInfo.role,
                institution: authInfo.institution,
                password: authInfo.password,
                score: 0,
                avatar: DEFAULT_AVATARS[0].id,
                drillHistory: [],
                xp: 0,
                level: 1,
// FIX: Add missing 'trophies' property for new user creation.
                trophies: 0,
                streak: { count: 0, lastActivityDate: null },
                unlockedAchievements: [],
            };
            await authService.createUser(newUser);
            await authService.createSession(newUser);
            setCurrentUser(newUser);
            setCurrentView('home');
            setAuthInfo(null); // Clear after use
        } else {
            setCurrentView('signup'); // Incomplete signup data
            setAuthInfo(null);
        }
    } else if (flow === 'forgotPassword') {
        // OTP is verified, now let user reset the password.
        // Don't clear authInfo yet, we need the email for the next step.
        setCurrentView('resetPassword');
    } else {
        setCurrentView('welcome');
        setAuthInfo(null);
    }
  }, [authInfo]);

  const handleLogout = useCallback(async () => {
    await authService.clearSession();
    setCurrentUser(null);
    setCurrentView('welcome');
  }, []);

  const handleStartDrill = useCallback((disasterType: DisasterType, difficulty: Difficulty, mode: DrillMode) => {
    setSelectedDisaster(disasterType);
    setSelectedDifficulty(difficulty);
    setSelectedMode(mode);
    setCurrentView('drill');
  }, []);

  const handleDrillComplete = useCallback(async (result: {
      disasterType: DisasterType;
      difficulty: Difficulty;
      mode: DrillMode;
      score?: number;
      totalQuestions?: number;
      stepsSurvived?: number;
  }) => {
    if (!currentUser) return;

    const newDrillEntry: DrillResult = {
      ...result,
      id: `drill_${Date.now()}`,
      date: new Date().toISOString(),
    };

    const { updatedUser, summary } = progressionService.processActivityCompletion(currentUser, {
        type: 'drill',
        details: newDrillEntry,
    });
    
    setCurrentUser(updatedUser);
    setLastDrillResult(summary);
    await authService.createSession(updatedUser);
    await analyticsService.updateAnalyticsOnDrillComplete(newDrillEntry);

  }, [currentUser]);
  
  const handleCloseSummary = () => {
      setLastDrillResult(null);
      // Optional: navigate back to drills lobby after summary
      setCurrentView('drills');
  }

  const renderAuthView = () => {
      switch (currentView) {
          case 'welcome':
              return <Welcome setView={setCurrentView} />;
          case 'login':
              return <Login onLogin={handleLogin} setView={setCurrentView} />;
          case 'signup':
              return <Signup onStartSignup={handleStartSignup} setView={setCurrentView} />;
          case 'forgotPassword':
              return <ForgotPassword onStartForgotPassword={handleStartForgotPassword} setView={setCurrentView} />;
          case 'resetPassword':
              if (authInfo?.flow === 'forgotPassword') {
                  return <ResetPassword onResetPassword={handleResetPassword} />;
              }
              return <Login onLogin={handleLogin} setView={setCurrentView} />;
          case 'verifyOtp':
              if (authInfo) {
                  return <VerifyOtp authInfo={authInfo} onVerified={handleOtpVerified} otpHint={authInfo.otpHint} />;
              }
              return <Login onLogin={handleLogin} setView={setCurrentView} />;
          default:
              return <Welcome setView={setCurrentView} />;
      }
  };

  const renderAppView = () => {
    if (!currentUser) return null; // Should not happen if this function is called

    switch (currentView) {
      case 'home':
        return <Home setView={setCurrentView} user={currentUser} />;
      case 'modules':
        return <EducationModules />;
      case 'videoLessons':
        return <VideoLessons user={currentUser} />;
      case 'drills':
        return <DrillsLobby onStartDrill={handleStartDrill} />;
      case 'drill':
        if (selectedDisaster) {
          return <VirtualDrill disasterType={selectedDisaster} region={selectedRegion} difficulty={selectedDifficulty} mode={selectedMode} onDrillComplete={handleDrillComplete} />;
        }
        return <Home setView={setCurrentView} user={currentUser} />; // Fallback
      case 'dashboard':
        if (currentUser.role === UserRole.Admin) {
          return <AdminDashboard setView={setCurrentView} theme={theme} />;
        }
        return <Home setView={setCurrentView} user={currentUser} />; // Fallback
      case 'contacts':
        return <EmergencyContacts />;
      case 'profile':
        return <Profile 
            user={currentUser} 
            setUser={async (updatedUser) => {
                setCurrentUser(updatedUser);
                await authService.createSession(updatedUser); // Update session storage
            }} 
            setView={setCurrentView} 
            onLogout={handleLogout}
            region={selectedRegion}
            setRegion={setSelectedRegion}
        />;
      case 'registerInstitution':
          if (currentUser.role === UserRole.Admin) {
              return <RegisterInstitution setView={setCurrentView} />;
          }
          return <Home setView={setCurrentView} user={currentUser} />; // Fallback
      default:
        return <Home setView={setCurrentView} user={currentUser} />;
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen bg-[--brand-bg] dark:bg-[--dark-bg]" />; // Or a loading spinner
  }

  if (!currentUser) {
    return (
      <div key={currentView} className="view-container-animation">
        {renderAuthView()}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
       <Header 
          currentView={currentView} 
          setView={setCurrentView} 
          user={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div key={currentView} className="view-container-animation">
          {renderAppView()}
        </div>
      </main>
      {lastDrillResult && currentUser && (
          <PostActivitySummary 
              summary={lastDrillResult} 
              user={currentUser} 
              onClose={handleCloseSummary}
          />
      )}
      <footer className="text-center py-8 text-sm text-[--brand-slate]">
          <p>&copy; {new Date().getFullYear()} CrisisGuardian. Secure. Smart. Prepared.</p>
      </footer>
    </div>
  );
};

export default App;
