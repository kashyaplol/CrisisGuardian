import React from 'react';
import { View, User, UserRole, Theme } from '../types';
import { INDIAN_STATES, DEFAULT_AVATARS } from '../constants';
import { ShieldCheckIcon, MapPinIcon, LogoutIcon, UserCircleIcon, SunIcon, MoonIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  region: string;
  setRegion: (region: string) => void;
  user: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
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


const Header: React.FC<HeaderProps> = ({ currentView, setView, region, setRegion, user, onLogout, theme, toggleTheme }) => {
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-slate-800 dark:text-white">CrisisGuardian</span>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {availableNavItems.map((item) => (
              <NavLink
                key={item.view}
                label={item.label}
                isActive={currentView === item.view}
                onClick={() => setView(item.view)}
              />
            ))}
          </nav>
          <div className="flex items-center">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors mr-4"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex items-center">
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
                    onClick={() => setView('profile')}
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
        </div>
      </div>
    </header>
  );
};

export default Header;