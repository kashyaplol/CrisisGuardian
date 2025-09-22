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
import { DEFAULT_AVATARS } from './constants';
import * as authService from './services/authService';

// Define a type for the temporary authentication information
type AuthInfo = {
  flow: 'signup'; // Login flow no longer needs temporary state
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  institution: string;
  password?: string; // Storing password temporarily during OTP verification
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [selectedRegion, setSelectedRegion] = useState<string>('Delhi');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const loggedInUser = authService.checkSession();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setCurrentView('home');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleLogin = useCallback((email: string, password: string): boolean => {
    const user = authService.loginUser(email, password);
    if (user) {
      authService.createSession(user);
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
    authService.sendOtp(details.email);
    setAuthInfo({ flow: 'signup', ...details });
    setCurrentView('verifyOtp');
  }, []);

  const handleOtpVerified = useCallback((email: string) => {
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
            authService.createUser(newUser);
            authService.createSession(newUser);
            setCurrentUser(newUser);
            setCurrentView('home');
        } else {
            // Incomplete signup data, send back.
            setCurrentView('signup');
        }
    } else {
        // Fallback if flow is not set.
        setCurrentView('welcome');
    }
    
    setAuthInfo(null);
  }, [authInfo]);

  const handleLogout = useCallback(() => {
    authService.clearSession();
    setCurrentUser(null);
    setCurrentView('welcome');
  }, []);

  const handleStartDrill = useCallback((disasterType: DisasterType, difficulty: Difficulty) => {
    setSelectedDisaster(disasterType);
    setSelectedDifficulty(difficulty);
    setCurrentView('drill');
  }, []);

  const handleDrillComplete = useCallback((result: {
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
    authService.createSession(updatedUser);
  }, [currentUser]);

  const renderAuthView = () => {
      switch (currentView) {
          case 'welcome':
              return <Welcome setView={setCurrentView} />;
          case 'login':
              return <Login onLogin={handleLogin} setView={setCurrentView} />;
          case 'signup':
              return <Signup onStartSignup={handleStartSignup} setView={setCurrentView} />;
          case 'verifyOtp':
              if (authInfo) {
                  return <VerifyOtp authInfo={authInfo} onVerified={handleOtpVerified} />;
              }
              // Fallback if authInfo is missing
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
        return <Profile user={currentUser} setUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            authService.createSession(updatedUser); // Update session storage
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
