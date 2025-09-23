import React, { useState, useCallback, useEffect } from 'react';
import { DisasterType, View, User, UserRole, Theme, Difficulty, DrillResult } from './types';
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
import { DEFAULT_AVATARS } from './constants';
import * as authService from './services/authService';
import * as analyticsService from './services/analyticsService';

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
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const checkUserSession = async () => {
        const loggedInUser = await authService.checkSession();
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
            setCurrentView('home');
        }
        setIsLoading(false);
    };
    checkUserSession();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
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

  const handleStartDrill = useCallback((disasterType: DisasterType, difficulty: Difficulty) => {
    setSelectedDisaster(disasterType);
    setSelectedDifficulty(difficulty);
    setCurrentView('drill');
  }, []);

  const handleDrillComplete = useCallback(async (result: {
    disasterType: DisasterType;
    difficulty: Difficulty;
    score: number;
    totalQuestions: number;
  }) => {
    if (!currentUser) return;

    const newDrillEntry: DrillResult = {
      ...result,
      id: `drill_${Date.now()}`,
      date: new Date().toISOString(),
    };

    const updatedHistory = [...(currentUser.drillHistory || []), newDrillEntry];

    // Recalculate average score
    const totalScorePercentage = updatedHistory.reduce(
      (sum, drill) => sum + (drill.score / drill.totalQuestions) * 100,
      0
    );
    const newAverageScore = updatedHistory.length > 0 ? Math.round(totalScorePercentage / updatedHistory.length) : 0;

    const updatedUser: User = {
      ...currentUser,
      score: newAverageScore,
      drillHistory: updatedHistory,
    };

    setCurrentUser(updatedUser);
    await authService.createSession(updatedUser);
    // Update dashboard analytics
    await analyticsService.updateAnalyticsOnDrillComplete(newDrillEntry);
  }, [currentUser]);

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
      case 'drills':
        return <DrillsLobby onStartDrill={handleStartDrill} />;
      case 'drill':
        if (selectedDisaster) {
          return <VirtualDrill disasterType={selectedDisaster} region={selectedRegion} difficulty={selectedDifficulty} onDrillComplete={handleDrillComplete} />;
        }
        return <Home setView={setCurrentView} user={currentUser} />; // Fallback
      case 'dashboard':
        if (currentUser.role === UserRole.Admin) {
          return <AdminDashboard theme={theme} setView={setCurrentView} />;
        }
        return <Home setView={setCurrentView} user={currentUser} />; // Fallback
      case 'contacts':
        return <EmergencyContacts />;
      case 'profile':
        return <Profile user={currentUser} setUser={async (updatedUser) => {
            setCurrentUser(updatedUser);
            await authService.createSession(updatedUser); // Update session storage
        }} setView={setCurrentView} />;
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
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />; // Or a loading spinner
  }

  if (!currentUser) {
    return (
      <div key={currentView} className="view-container-animation">
        {renderAuthView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
       <Header 
          currentView={currentView} 
          setView={setCurrentView} 
          region={selectedRegion} 
          setRegion={setSelectedRegion} 
          user={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      <main key={currentView} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 view-container-animation">
        {renderAppView()}
      </main>
      <footer className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} CrisisGuardian. Building a safer India.</p>
      </footer>
    </div>
  );
};

export default App;