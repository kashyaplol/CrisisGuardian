import React, { useState } from 'react';
import { View } from '../types';
import * as authService from '../services/authService';
import { CheckCircleIcon, XCircleIcon, AcademicCapIcon } from './icons/Icons';

interface RegisterInstitutionProps {
    setView: (view: View) => void;
}

const RegisterInstitution: React.FC<RegisterInstitutionProps> = ({ setView }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'school' | 'college'>('school');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Institution name cannot be empty.' });
            return;
        }

        const success = authService.addInstitution(name, type);

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
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Register an Institution</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Add a new school or college to the platform's database.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="institution-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Institution Name
                        </label>
                        <div className="relative">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <AcademicCapIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                id="institution-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., St. Stephen's College"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Institution Type
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="institution-type"
                                    value="school"
                                    checked={type === 'school'}
                                    onChange={() => setType('school')}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
                                />
                                <span className="dark:text-slate-200">School</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="institution-type"
                                    value="college"
                                    checked={type === 'college'}
                                    onChange={() => setType('college')}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300"
                                />
                                <span className="dark:text-slate-200">College</span>
                            </label>
                        </div>
                    </div>

                    {message && (
                        <div className={`flex items-center p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> : <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />}
                            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setView('dashboard')} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
                            Back to Dashboard
                        </button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                            Register Institution
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterInstitution;