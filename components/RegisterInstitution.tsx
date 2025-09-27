import React, { useState } from 'react';
import { View } from '../types';
import * as authService from '../services/authService';
import { CheckCircleIcon, XCircleIcon, AcademicCapIcon, ArrowPathIcon } from './icons/Icons';

interface RegisterInstitutionProps {
    setView: (view: View) => void;
}

const RegisterInstitution: React.FC<RegisterInstitutionProps> = ({ setView }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'school' | 'college'>('school');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Institution name cannot be empty.' });
            return;
        }

        setIsLoading(true);
        const success = await authService.addInstitution(name, type);
        setIsLoading(false);

        if (success) {
            setMessage({ type: 'success', text: `Successfully registered ${name}!` });
            setName('');
        } else {
            setMessage({ type: 'error', text: `${name} already exists.` });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold sm:text-4xl">Register an Institution</h1>
                <p className="mt-4 text-lg text-[--brand-slate]">Add a new school or college to the platform's database.</p>
            </div>
            <div className="bg-white dark:bg-[--dark-surface] rounded-3xl soft-shadow p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="institution-name" className="block text-sm font-medium text-[--brand-slate] mb-1">
                            Institution Name
                        </label>
                        <div className="relative">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <AcademicCapIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                id="institution-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., WonderKids International School"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-purple-500/5 dark:bg-white/10 border-2 border-transparent focus:border-[--brand-purple] focus:ring-0 rounded-2xl transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[--brand-slate] mb-2">
                            Institution Type
                        </label>
                        <div className="flex gap-4">
                             <button type="button" onClick={() => setType('school')} className={`w-full py-3 px-4 rounded-2xl border-2 transition font-bold ${type === 'school' ? 'bg-purple-500/10 border-[--brand-purple] dark:bg-purple-500/20' : 'bg-black/5 border-transparent hover:border-black/10 dark:bg-white/10 dark:hover:border-white/20'}`}>School</button>
                             <button type="button" onClick={() => setType('college')} className={`w-full py-3 px-4 rounded-2xl border-2 transition font-bold ${type === 'college' ? 'bg-purple-500/10 border-[--brand-purple] dark:bg-purple-500/20' : 'bg-black/5 border-transparent hover:border-black/10 dark:bg-white/10 dark:hover:border-white/20'}`}>College</button>
                        </div>
                    </div>

                    {message && (
                        <div className={`flex items-center p-3 rounded-2xl ${message.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> : <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />}
                            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setView('dashboard')} className="px-6 py-3 rounded-2xl bg-black/10 text-[--brand-text] font-semibold hover:bg-black/20 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20 transition-colors">
                            Back to Dashboard
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-6 py-3 rounded-2xl bg-[--brand-purple] text-white font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <ArrowPathIcon className="animate-spin h-5 w-5" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                'Register Institution'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterInstitution;