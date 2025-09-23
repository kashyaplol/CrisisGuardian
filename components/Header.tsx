import React from 'react';
import { View, User, UserRole, Theme } from '../types';
import { INDIAN_STATES, DEFAULT_AVATARS } from '../constants';
import { CrisisGuardianLogo, MapPinIcon, LogoutIcon, UserCircleIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  region: string;
  setRegion: (region: string) => void;
  user: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}> = ({ label, isActive, onClick, isMobile = false }) => (
  <button
    onClick={onClick}
    className={`w-full text-left font-medium transition-colors duration-200 ${
        isMobile
        ? `px-4 py-3 text-lg rounded-lg ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`
        : `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'}`
    }`}
  >
    {label}
  </button>
);

const Avatar: React.FC<{ avatar: string; className?: string }> = ({ avatar, className }) => {
  if (avatar.startsWith('data:image/')) {
      return <img src={avatar} alt="User Avatar" className={`rounded-full object-cover ${className}`} />;
  }
  const DefaultAvatar = DEFAULT_AVATARS.find(a => a.id === avatar)?.Icon;
  return DefaultAvatar ? <DefaultAvatar className={className} /> : <UserCircleIcon className={className} />;
};


const Header: React.FC<HeaderProps> = ({ currentView, setView, region, setRegion, user, onLogout, theme, toggleTheme, isSidebarOpen, setIsSidebarOpen }) => {
    const navItems: { view: View; label: string; requiredRole?: UserRole }[] = [
    { view: 'home', label: 'Home' },
    { view: 'modules', label: 'Study Modules' },
    { view: 'drills', label: 'Virtual Drills' },
    { view: 'dashboard', label: 'Dashboard', requiredRole: UserRole.Admin },
    { view: 'contacts', label: 'Contacts' },
  ];

  const availableNavItems = navItems.filter(item => {
      if (!item.requiredRole) return true;
      return user?.role === item.requiredRole;
  });
  
  const handleNavClick = (view: View) => {
      setView(view);
      setIsSidebarOpen(false);
  };
  
  const handleLogoutClick = () => {
    onLogout();
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40 dark:bg-slate-800 dark:border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CrisisGuardianLogo />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {availableNavItems.map((item) => (
                <NavLink
                  key={item.view}
                  label={item.label}
                  isActive={currentView === item.view}
                  onClick={() => handleNavClick(item.view)}
                />
              ))}
            </nav>
            
            <div className="flex items-center">
                {/* Desktop Controls */}
                <div className="hidden md:flex items-center">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors mr-4"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mr-2" />
                        <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded-md py-1.5 px-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                        >
                        {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                            {state}
                            </option>
                        ))}
                        </select>
                    </div>
                    <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-4 ml-4">
                        <button 
                            onClick={() => handleNavClick('profile')}
                            className="flex items-center text-sm text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                            aria-label="View Profile"
                        >
                            <Avatar avatar={user.avatar} className="h-8 w-8 text-slate-500 dark:text-slate-400 mr-2" />
                            <span className="font-medium hidden sm:inline">{user.name}</span>
                        </button>
                        <button 
                            onClick={onLogout} 
                            className="ml-3 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Hamburger Menu */}
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                    aria-label="Open navigation menu"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 ${isSidebarOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isSidebarOpen} role="dialog" aria-modal="true">
        {/* Overlay */}
        <div
            className={`absolute inset-0 bg-black bg-opacity-60 ${isSidebarOpen ? 'animate-fade-in' : 'animate-fade-out opacity-0'}`}
            onClick={() => setIsSidebarOpen(false)}
        />
        {/* Panel */}
        <div
            className={`relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-800 shadow-xl flex flex-col ${isSidebarOpen ? 'animate-slide-in-from-left' : 'animate-slide-out-to-left -translate-x-full'}`}
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <CrisisGuardianLogo />
                 <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                    aria-label="Close navigation menu"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                <div className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 mb-4">
                     <Avatar avatar={user.avatar} className="h-12 w-12 text-slate-500 dark:text-slate-400 mr-3" />
                     <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                     </div>
                </div>
                <nav className="flex-grow space-y-2">
                    {availableNavItems.map((item) => (
                        <NavLink
                            key={item.view}
                            label={item.label}
                            isActive={currentView === item.view}
                            onClick={() => handleNavClick(item.view)}
                            isMobile
                        />
                    ))}
                     <NavLink
                        label="My Profile"
                        isActive={currentView === 'profile'}
                        onClick={() => handleNavClick('profile')}
                        isMobile
                    />
                </nav>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-2">
                        <label htmlFor="region-select-mobile" className="text-sm font-medium text-slate-700 dark:text-slate-300">Region</label>
                        <select
                            id="region-select-mobile"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-slate-100 border border-slate-300 rounded-md py-1.5 px-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                        >
                            {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center justify-between p-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                        </button>
                    </div>
                     <button 
                        onClick={handleLogoutClick} 
                        className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-500 font-bold py-3 px-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        aria-label="Logout"
                    >
                        <LogoutIcon className="h-6 w-6" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;