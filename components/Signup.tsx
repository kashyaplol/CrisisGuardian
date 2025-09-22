import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, View } from '../types';
import { CrisisGuardianLogo, AcademicCapIcon, BriefcaseIcon, ShieldCheckIcon, UserCircleIcon, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, BookOpenIcon, BoltIcon, UsersIcon } from './icons/Icons';
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

  const [institutionType, setInstitutionType] = useState<'school' | 'college' | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<{schools: string[], colleges: string[]}>({ schools: [], colleges: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [otherInstitution, setOtherInstitution] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllInstitutions(authService.getInstitutions());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const filteredInstitutions = useMemo(() => {
    if (!institutionType) return [];
    const list = institutionType === 'school' ? allInstitutions.schools : allInstitutions.colleges;
    const searchFiltered = list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    return ['Other', ...searchFiltered];
  }, [searchTerm, institutionType, allInstitutions]);

  const handleSelectInstitution = (inst: string) => {
    setSelectedInstitution(inst);
    setSearchTerm(inst === 'Other' ? '' : inst);
    setIsDropdownOpen(false);
    if (inst !== 'Other') {
        setOtherInstitution('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      setIsLoading(false);
      return;
    }
    
    if (!institutionType) {
        setError('Please select if you are from a school or college.');
        setIsLoading(false);
        return;
    }

    const finalInstitution = selectedInstitution === 'Other' ? otherInstitution.trim() : selectedInstitution.trim();
    if (!finalInstitution) {
        setError('Please select or enter your institution.');
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (authService.findUserByEmail(email)) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    onStartSignup({
      name,
      email,
      role: selectedRole,
      institution: finalInstitution,
      password
    });
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in-slow">
         <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593941707882-6828203993b0?q=80&w=2574&auto=format&fit=crop')`, opacity: 0.15 }}
        ></div>
         <div className="z-10 text-center">
            <CrisisGuardianLogo className="justify-center mb-6" />
            <p className="text-slate-300 text-lg max-w-sm">
                Empowering campuses with the knowledge to face disasters with confidence.
            </p>
            <div className="mt-12 space-y-6 text-left w-full max-w-xs mx-auto">
                <div className="flex items-center gap-4">
                    <BookOpenIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">In-Depth Study Modules</p>
                </div>
                <div className="flex items-center gap-4">
                    <BoltIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">AI-Powered Virtual Drills</p>
                </div>
                 <div className="flex items-center gap-4">
                    <UsersIcon className="h-7 w-7 text-blue-400 flex-shrink-0" />
                    <p className="font-semibold text-slate-200">Campus-Wide Analytics</p>
                </div>
            </div>
         </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-in-from-right">
             <div className="text-center lg:hidden mb-8">
                <CrisisGuardianLogo className="justify-center" />
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Create an Account</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Join the mission to build a safer tomorrow.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</legend>
                    <div className="grid grid-cols-3 gap-4">
                        <RoleCard role={UserRole.Student} icon={AcademicCapIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                        <RoleCard role={UserRole.Teacher} icon={BriefcaseIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                        <RoleCard role={UserRole.Admin} icon={ShieldCheckIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">My institution is a...</legend>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setInstitutionType('school')} className={`w-full py-2 px-4 rounded-lg border-2 transition ${institutionType === 'school' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500' : 'bg-white border-slate-300 hover:border-blue-400 dark:bg-slate-700 dark:border-slate-600'}`}>School</button>
                        <button type="button" onClick={() => setInstitutionType('college')} className={`w-full py-2 px-4 rounded-lg border-2 transition ${institutionType === 'college' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500' : 'bg-white border-slate-300 hover:border-blue-400 dark:bg-slate-700 dark:border-slate-600'}`}>College</button>
                    </div>
                </fieldset>
                
                {institutionType && (
                    <div className="relative" ref={dropdownRef}>
                        <label htmlFor="institution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Institution Name
                        </label>
                        <div className="relative">
                            <input
                              type="text"
                              id="institution"
                              value={searchTerm}
                              onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); setSelectedInstitution(''); }}
                              onFocus={() => setIsDropdownOpen(true)}
                              placeholder={`Search for a ${institutionType}...`}
                              autoComplete="off"
                              className="w-full py-2 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                            {isDropdownOpen && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {filteredInstitutions.map((inst, idx) => (
                                        <li key={idx} onClick={() => handleSelectInstitution(inst)} className="px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">{inst}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {selectedInstitution === 'Other' && (
                            <input
                              type="text"
                              value={otherInstitution}
                              onChange={(e) => setOtherInstitution(e.target.value)}
                              placeholder="Please specify your institution"
                              className="w-full mt-2 py-2 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                        )}
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                        <UserCircleIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                        <EnvelopeIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <div className="relative">
                        <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                        <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                            Processing...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Log In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
