import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, View } from '../types';
import { CrisisGuardianLogo, AcademicCapIcon, BriefcaseIcon, ShieldCheckIcon, UserCircleIcon, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';
import * as authService from '../services/authService';

interface SignupProps {
  onStartSignup: (details: {
      name: string,
      email: string,
      phone?: string,
      role: UserRole,
      institution: string,
      password?: string
    }) => Promise<boolean>;
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
    className={`w-full p-4 text-center border-2 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center h-full ${
      selectedRole === role
        ? 'bg-purple-500/10 border-[--brand-purple] ring-2 ring-[--brand-purple] dark:bg-purple-500/20'
        : 'bg-black/5 border-transparent hover:border-black/10 dark:bg-white/10 dark:hover:border-white/20'
    }`}
  >
    <Icon className={`h-10 w-10 mx-auto mb-2 ${selectedRole === role ? 'text-[--brand-purple]' : 'text-[--brand-slate]'}`} />
    <span className="font-semibold text-sm">{role}</span>
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [institutionType, setInstitutionType] = useState<'school' | 'college' | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<{schools: string[], colleges: string[]}>({ schools: [], colleges: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [otherInstitution, setOtherInstitution] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInstitutions = async () => {
        const institutions = await authService.getInstitutions();
        setAllInstitutions(institutions);
    };
    fetchInstitutions();
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

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
    }

    const started = await onStartSignup({
      name,
      email,
      role: selectedRole,
      institution: finalInstitution,
      password
    });

    if (!started) {
      setError('Could not send verification code right now. Please try again.');
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[--brand-bg] dark:bg-[--dark-bg] p-6">
      <div className="w-full max-w-md">
           <div className="text-center mb-10">
                <CrisisGuardianLogo className="justify-center" />
            </div>
          <div className="bg-white dark:bg-[--dark-surface] p-8 rounded-3xl soft-shadow">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Create Your Account</h2>
              <p className="text-[--brand-slate] mt-2">Join the mission to build a safer tomorrow.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset>
                    <legend className="block text-sm font-semibold text-[--brand-slate] mb-2">I am a...</legend>
                    <div className="grid grid-cols-3 gap-4">
                        <RoleCard role={UserRole.Student} icon={AcademicCapIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                        <RoleCard role={UserRole.Teacher} icon={BriefcaseIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                        <RoleCard role={UserRole.Admin} icon={ShieldCheckIcon} selectedRole={selectedRole} onSelect={setSelectedRole} />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="block text-sm font-semibold text-[--brand-slate] mb-2">My institution is a...</legend>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setInstitutionType('school')} className={`w-full py-3 px-4 rounded-2xl border-2 transition font-bold ${institutionType === 'school' ? 'bg-purple-500/10 border-[--brand-purple] dark:bg-purple-500/20' : 'bg-black/5 border-transparent hover:border-black/10 dark:bg-white/10 dark:hover:border-white/20'}`}>School</button>
                        <button type="button" onClick={() => setInstitutionType('college')} className={`w-full py-3 px-4 rounded-2xl border-2 transition font-bold ${institutionType === 'college' ? 'bg-purple-500/10 border-[--brand-purple] dark:bg-purple-500/20' : 'bg-black/5 border-transparent hover:border-black/10 dark:bg-white/10 dark:hover:border-white/20'}`}>College</button>
                    </div>
                </fieldset>
                
                {institutionType && (
                    <div className="relative" ref={dropdownRef}>
                        <label htmlFor="institution" className="block text-sm font-semibold text-[--brand-slate] mb-2">
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
                              className="w-full py-3 px-4 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl"
                            />
                            {isDropdownOpen && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-[--dark-surface] border-2 border-black/5 dark:border-white/10 rounded-2xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {filteredInstitutions.map((inst, idx) => (
                                        <li key={idx} onClick={() => handleSelectInstitution(inst)} className="px-4 py-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10">{inst}</li>
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
                              className="w-full mt-2 py-3 px-4 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl"
                            />
                        )}
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-semibold text-[--brand-slate] mb-2">Full Name</label>
                    <div className="relative">
                        <UserCircleIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="w-full py-3 pl-12 pr-4 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[--brand-slate] mb-2">Email Address</label>
                     <div className="relative">
                        <EnvelopeIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full py-3 pl-12 pr-4 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-[--brand-slate] mb-2">Password</label>
                    <div className="relative">
                        <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                        <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pr-12 py-3 pl-12 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl" />
                         <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[--brand-text] dark:hover:text-white">
                            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[--brand-slate] mb-2">Confirm Password</label>
                    <div className="relative">
                        <LockClosedIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-4" aria-hidden="true" />
                        <input type={isConfirmPasswordVisible ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="w-full pr-12 py-3 pl-12 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl" />
                        <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[--brand-text] dark:hover:text-white">
                            {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[--brand-purple] text-white font-bold py-4 px-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:-translate-y-1 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
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
          </div>
           <p className="text-center text-sm text-[--brand-slate] mt-8">
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="font-bold text-[--brand-purple] hover:underline">
                    Log In
                </button>
            </p>
        </div>
      </div>
  );
};

export default Signup;
