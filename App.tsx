import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

const VIEW_PATHS: Record<View, string> = {
  welcome: '/',
  signup: '/signup',
  login: '/login',
  verifyOtp: '/verify-otp',
  home: '/home',
  modules: '/modules',
  drills: '/drills',
  drill: '/drill',
  dashboard: '/dashboard',
  contacts: '/contacts',
  profile: '/profile',
  registerInstitution: '/register-institution',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  videoLessons: '/video-lessons',
};

const AUTH_VIEWS = new Set<View>(['welcome', 'signup', 'login', 'verifyOtp', 'forgotPassword', 'resetPassword']);

const getViewFromPath = (pathname: string): View => {
  switch (pathname) {
    case '/':
    case '/welcome':
      return 'welcome';
    case '/signup':
      return 'signup';
    case '/login':
      return 'login';
    case '/verify-otp':
      return 'verifyOtp';
    case '/home':
      return 'home';
    case '/modules':
      return 'modules';
    case '/drills':
      return 'drills';
    case '/drill':
      return 'drill';
    case '/dashboard':
      return 'dashboard';
    case '/contacts':
      return 'contacts';
    case '/profile':
      return 'profile';
    case '/register-institution':
      return 'registerInstitution';
    case '/forgot-password':
      return 'forgotPassword';
    case '/reset-password':
      return 'resetPassword';
    case '/video-lessons':
      return 'videoLessons';
    default:
      return 'welcome';
  }
};

const App: React.FC = () => {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  const navigateToPath = useCallback((path: string, replace = false) => {
    if (window.location.pathname === path) return;
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setPathname(path);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const currentView = useMemo(() => getViewFromPath(pathname), [pathname]);
  const setView = useCallback((view: View) => {
    navigateToPath(VIEW_PATHS[view]);
  }, [navigateToPath]);
  const replaceView = useCallback((view: View) => {
    navigateToPath(VIEW_PATHS[view], true);
  }, [navigateToPath]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [startupError, setStartupError] = useState<string | null>(null);
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
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setStartupError(null);
        await authService.seedInitialUsers();
        const loggedInUser = await authService.checkSession();
        if (loggedInUser) {
          setCurrentUser(loggedInUser);
        }
      } catch (error) {
        console.error('[CrisisGuardian] App startup failed:', error);
        setStartupError('Could not connect to the backend API. Please ensure the API server is running.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser && !AUTH_VIEWS.has(currentView)) {
      replaceView('welcome');
      return;
    }

    if (currentUser && AUTH_VIEWS.has(currentView)) {
      replaceView('home');
      return;
    }

    if (currentUser && currentView === 'dashboard' && currentUser.role !== UserRole.Admin) {
      replaceView('home');
      return;
    }

    if (currentUser && currentView === 'registerInstitution' && currentUser.role !== UserRole.Admin) {
      replaceView('home');
      return;
    }

    if (currentUser && currentView === 'drill' && !selectedDisaster) {
      replaceView('drills');
    }
  }, [currentUser, currentView, isLoading, replaceView, selectedDisaster]);

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
      setView('home');
      return true;
    }
    return false;
  }, [setView]);

  const handleStartSignup = useCallback(async (details: {
    name: string,
    email: string,
    phone?: string,
    role: UserRole,
    institution: string,
    password?: string
  }): Promise<boolean> => {
    try {
      const otpHint = await authService.requestSignupOtp(details.email);
      setAuthInfo({ flow: 'signup', ...details, otpHint });
      setView('verifyOtp');
      return true;
    } catch {
      return false;
    }
  }, [setView]);

  const handleStartForgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const otpHint = await authService.requestPasswordReset(email);
      setAuthInfo({ flow: 'forgotPassword', email, otpHint });
      setView('verifyOtp');
      return true;
    } catch {
      return false;
    }
  }, [setView]);

  const handleVerifyOtpCode = useCallback(
    async (otp: string): Promise<boolean> => {
      if (!authInfo) return false;
      if (authInfo.flow === 'signup') {
        return authService.verifySignupOtp(authInfo.email, otp);
      }
      return authService.verifyPasswordResetOtp(authInfo.email, otp);
    },
    [authInfo]
  );

  const handleResetPassword = useCallback(async (password: string): Promise<void> => {
    if (authInfo?.flow === 'forgotPassword') {
      await authService.updatePassword(password);
      authService.clearPendingPasswordReset();
      setAuthInfo(null);
      setView('login');
    }
  }, [authInfo, setView]);

  const handleOtpVerified = useCallback(async (_email: string) => {
    const { flow } = authInfo || {};

    if (flow === 'signup') {
      if (authInfo?.name && authInfo?.role && authInfo?.institution && authInfo?.password) {
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
          trophies: 0,
          streak: { count: 0, lastActivityDate: null },
          unlockedAchievements: [],
        };
        const created = await authService.createUser(newUser);
        if (!created) {
          setView('signup');
          setAuthInfo(null);
          return;
        }
        const sessionUser = await authService.checkSession();
        setCurrentUser(sessionUser || { ...newUser, password: undefined });
        setView('home');
        setAuthInfo(null);
      } else {
        setView('signup');
        setAuthInfo(null);
      }
    } else if (flow === 'forgotPassword') {
      setView('resetPassword');
    } else {
      setView('welcome');
      setAuthInfo(null);
    }
  }, [authInfo, setView]);

  const handleLogout = useCallback(async () => {
    await authService.clearSession();
    setCurrentUser(null);
    setView('welcome');
  }, [setView]);

  const handleStartDrill = useCallback((disasterType: DisasterType, difficulty: Difficulty, mode: DrillMode) => {
    setSelectedDisaster(disasterType);
    setSelectedDifficulty(difficulty);
    setSelectedMode(mode);
    setView('drill');
  }, [setView]);

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
    setView('drills');
  };

  const renderAuthView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome setView={setView} />;
      case 'login':
        return <Login onLogin={handleLogin} setView={setView} />;
      case 'signup':
        return <Signup onStartSignup={handleStartSignup} setView={setView} />;
      case 'forgotPassword':
        return <ForgotPassword onStartForgotPassword={handleStartForgotPassword} setView={setView} />;
      case 'resetPassword':
        if (authInfo?.flow === 'forgotPassword') {
          return <ResetPassword onResetPassword={handleResetPassword} />;
        }
        return <Login onLogin={handleLogin} setView={setView} />;
      case 'verifyOtp':
        if (authInfo) {
          return (
            <VerifyOtp
              authInfo={authInfo}
              verifyCode={handleVerifyOtpCode}
              onVerified={handleOtpVerified}
              otpHint={authInfo.otpHint}
            />
          );
        }
        return <Login onLogin={handleLogin} setView={setView} />;
      default:
        return <Welcome setView={setView} />;
    }
  };

  const renderAppView = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'home':
        return <Home setView={setView} user={currentUser} />;
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
        return <Home setView={setView} user={currentUser} />;
      case 'dashboard':
        if (currentUser.role === UserRole.Admin) {
          return <AdminDashboard setView={setView} theme={theme} />;
        }
        return <Home setView={setView} user={currentUser} />;
      case 'contacts':
        return <EmergencyContacts />;
      case 'profile':
        return <Profile
          user={currentUser}
          setUser={async (updatedUser) => {
            setCurrentUser(updatedUser);
            await authService.createSession(updatedUser);
          }}
          setView={setView}
          onLogout={handleLogout}
          region={selectedRegion}
          setRegion={setSelectedRegion}
        />;
      case 'registerInstitution':
        if (currentUser.role === UserRole.Admin) {
          return <RegisterInstitution setView={setView} />;
        }
        return <Home setView={setView} user={currentUser} />;
      default:
        return <Home setView={setView} user={currentUser} />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[--brand-bg] dark:bg-[--dark-bg]" />;
  }

  if (startupError && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[--brand-bg] dark:bg-[--dark-bg]">
        <div className="max-w-xl w-full bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Startup Error</h1>
          <p className="text-[--brand-slate] mb-6">{startupError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[--brand-purple] text-white font-bold py-3 px-6 rounded-2xl hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div key={pathname} className="view-container-animation">
        {renderAuthView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentView={currentView}
        setView={setView}
        user={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div key={pathname} className="view-container-animation">
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
