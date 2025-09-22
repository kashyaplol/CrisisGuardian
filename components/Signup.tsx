import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, View } from '../types';
// FIX: Import `ArrowPathIcon` to fix a compilation error where it was used without being imported.
import { ShieldCheckIcon, AcademicCapIcon, BriefcaseIcon, UserCircleIcon, EnvelopeIcon, DevicePhoneMobileIcon, LockClosedIcon, ArrowPathIcon } from './icons/Icons';
import * as authService from '../services/authService';

interface SignupProps {
  onStartSignup: (details: {
      name: string,
      email: string,
      phone?: string,
      role: UserRole,
      institution: string,
      password?: string
    }) => void;
  setView: (view: View) => void;
}

const RoleCard: React.FC<{
  role: UserRole;
  icon: React.ElementType;
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}> = ({ role, icon: Icon, selectedRole, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(role)}
    className={`w-full p-4 text-center border-2 rounded-lg transition-all duration-300 ${
      selectedRole === role
        ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500 dark:bg-blue-900/50 dark:border-blue-500'
        : 'bg-white border-slate-300 hover:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500'
    }`}
  >
    <Icon className={`h-10 w-10 mx-auto mb-2 ${selectedRole === role ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{role}</span>
  </button>
);

const Signup: React.FC<SignupProps> = ({ onStartSignup, setView }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for institution selection
  const [institutionType, setInstitutionType] = useState<'school' | 'college' | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<{schools: string[], colleges: string[]}>({ schools: [], colleges: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [otherInstitution, setOtherInstitution] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  useEffect(() => {
    setAllInstitutions(authService.getInstitutions());
  }, []);

  const filteredInstitutions = useMemo(() => {
      if (!institutionType) return [];
      const list = institutionType === 'school' ? allInstitutions.schools : allInstitutions.colleges;
      if (!searchTerm) return list;
      return list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, institutionType, allInstitutions]);

  const handleSelectInstitution = (inst: string) => {
    setSelectedInstitution(inst);
    setSearchTerm(inst === 'Other' ? '' : inst);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      return setError('Name must be at least 3 characters.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address.');
    }
    if (authService.findUserByEmail(email)) {
      return setError('An account with this email already exists.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    const finalInstitution = selectedInstitution === 'Other' ? otherInstitution.trim() : selectedInstitution;
    if (!finalInstitution) {
        return setError('Please select or enter your institution.');
    }
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
        onStartSignup({ name: name.trim(), email, role: selectedRole, institution: finalInstitution, password });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">Create Your Account</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Join CrisisGuardian and start learning today.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <UserCircleIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                  </div>
              </div>
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                  </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="password" cla-ssName="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                 </div>
                 <div>
                    <label htmlFor="confirm-password" cla-ssName="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>
            </div>
            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Your Role</legend>
              <div className="grid grid-cols-3 gap-4">
                  <RoleCard role={UserRole.Student} icon={AcademicCapIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                  <RoleCard role={UserRole.Teacher} icon={BriefcaseIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                  <RoleCard role={UserRole.Admin} icon={ShieldCheckIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Institution</legend>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button type="button" onClick={() => { setInstitutionType('school'); setSelectedInstitution(''); setSearchTerm(''); }} className={`py-2 rounded-lg font-semibold border-2 ${institutionType === 'school' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50' : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'}`}>School</button>
                <button type="button" onClick={() => { setInstitutionType('college'); setSelectedInstitution(''); setSearchTerm(''); }} className={`py-2 rounded-lg font-semibold border-2 ${institutionType === 'college' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50' : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'}`}>College</button>
              </div>

              {institutionType && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); setSelectedInstitution(''); }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                    placeholder={`Search for your ${institutionType}...`}
                    className="w-full pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-controls="institution-listbox"
                  />
                  {isDropdownOpen && (
                    <div 
                        id="institution-listbox"
                        role="listbox"
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                    >
                      {filteredInstitutions.map(inst => (
                        <button type="button" key={inst} onClick={() => handleSelectInstitution(inst)} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600" role="option">{inst}</button>
                      ))}
                      <button type="button" onClick={() => handleSelectInstitution('Other')} className="w-full text-left px-4 py-2 font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600" role="option">Other...</button>
                    </div>
                  )}
                </div>
              )}
              {selectedInstitution === 'Other' && (
                <div className="mt-2">
                   <input type="text" value={otherInstitution} onChange={(e) => setOtherInstitution(e.target.value)} placeholder="Please specify your institution" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                </div>
              )}
            </fieldset>
             
             {error && <p className="text-red-500 text-sm text-center" aria-live="polite">{error}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
               {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
               {isLoading ? 'Processing...' : 'Create Account'}
            </button>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Login
            </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
