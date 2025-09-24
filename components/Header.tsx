import React, { useEffect, useState } from 'react';
import { View, User, UserRole } from '../types';
import { DEFAULT_AVATARS } from '../constants';
import { CrisisGuardianLogo, UserCircleIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  user: User;
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
    className={`w-full text-left font-semibold transition-all duration-300 relative ${
        isMobile
        ? `px-4 py-3 text-lg rounded-xl ${isActive ? 'bg-white/10 text-[--brand-orange]' : 'text-slate-200 hover:bg-white/10 hover:text-[--brand-orange]'}`
        : `px-4 py-2 rounded-full text-sm ${isActive ? 'bg-[--brand-orange] text-white' : 'text-slate-300 hover:bg-white/10 dark:text-[--dark-text] dark:hover:bg-white/10'}`
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


const Header: React.FC<HeaderProps> = ({ currentView, setView, user, isSidebarOpen, setIsSidebarOpen }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems: { view: View; label: string; requiredRole?: UserRole }[] = [
    { view: 'home', label: 'Home' },
    { view: 'modules', label: 'Study Modules' },
    { view: 'videoLessons', label: 'Video Lessons' },
    { view: 'drills', label: 'Virtual Drills' },
    { view: 'contacts', label: 'Contacts' },
    { view: 'dashboard', label: 'Dashboard', requiredRole: UserRole.Admin },
  ];

  const availableNavItems = navItems.filter(item => {
      if (!item.requiredRole) return true;
      return user?.role === item.requiredRole;
  });
  
  const handleNavClick = (view: View) => {
      setView(view);
      setIsSidebarOpen(false);
  };
  
  const headerClasses = `sticky top-0 z-40 transition-all duration-300 ${
    scrolled ? 'bg-[--brand-beige]/80 dark:bg-[--dark-bg]/80 backdrop-blur-md shadow-md' : 'bg-transparent'
  }`;

  return (
    <>
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-1 flex justify-start">
              <button onClick={() => handleNavClick('home')} aria-label="Go to homepage">
                <CrisisGuardianLogo />
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
                <nav className="flex items-center space-x-2 bg-[--brand-charcoal]/80 backdrop-blur-md dark:bg-white/10 p-2 rounded-full">
                {availableNavItems.map((item) => (
                    <NavLink
                    key={item.view}
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => handleNavClick(item.view)}
                    />
                ))}
                </nav>
            </div>
            
            <div className="flex-1 flex items-center justify-end">
                {/* Desktop Controls */}
                <div className="hidden md:flex items-center space-x-2">
                    <button 
                        onClick={() => handleNavClick('profile')}
                        className="flex items-center bg-white dark:bg-[--dark-surface] pl-2 pr-4 py-1 rounded-full soft-shadow transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="View Profile"
                    >
                        <Avatar avatar={user.avatar} className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                        <span className="font-bold hidden sm:inline ml-2 text-[--brand-charcoal] dark:text-[--dark-text] text-sm">{user.name}</span>
                    </button>
                </div>

                {/* Mobile Hamburger Menu */}
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md text-[--brand-charcoal] dark:text-slate-400"
                    aria-label="Open navigation menu"
                >
                    <Bars3Icon className="h-7 w-7" />
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
            className={`relative w-72 max-w-[80vw] h-full bg-[--brand-charcoal]/95 backdrop-blur-sm dark:bg-[--dark-surface] shadow-xl flex flex-col ${isSidebarOpen ? 'animate-slide-in-from-left' : 'animate-slide-out-to-left -translate-x-full'}`}
        >
            <div className="p-4 border-b border-white/10 flex justify-between items-center text-white">
                <button onClick={() => handleNavClick('home')} aria-label="Go to homepage">
                  <CrisisGuardianLogo />
                </button>
                 <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-md text-slate-400 hover:text-white"
                    aria-label="Close navigation menu"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto flex flex-col">
                <div className="flex items-center p-2 rounded-2xl bg-white/5 dark:bg-white/10 mb-4">
                     <Avatar avatar={user.avatar} className="h-12 w-12 text-slate-500 dark:text-slate-400 mr-3" />
                     <div>
                        <p className="font-bold text-lg text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.role}</p>
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
                </nav>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;
