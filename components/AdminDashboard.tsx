import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { UsersIcon, ShieldCheckIcon, PresentationChartBarIcon, AcademicCapIcon } from './icons/Icons';
import { Theme, View } from '../types';
import * as authService from '../services/authService';
import * as analyticsService from '../services/analyticsService';
import { DISASTER_MODULES } from '../constants';

interface AdminDashboardProps {
  setView: (view: View) => void;
  theme: Theme;
}

const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28'];

// Placeholder data for the skills chart, which is not yet connected to dynamic data
const skillData = [
    { subject: 'Evacuation', A: 80, fullMark: 100 },
    { subject: 'First Aid', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 75, fullMark: 100 },
    { subject: 'Equipment Use', A: 65, fullMark: 100 },
    { subject: 'Risk Assessment', A: 85, fullMark: 100 },
];

const DashboardSkeleton: React.FC = () => (
    <div>
        {/* Title skeleton */}
        <div className="text-center mb-12">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 mx-auto animate-pulse"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mx-auto mt-4 animate-pulse"></div>
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow flex items-center">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full mr-4 animate-pulse"></div>
                    <div className="flex-grow space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
        {/* Admin tools skeleton */}
        <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow mb-8">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-12 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
                 <div key={i} className={`bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow ${i === 2 ? 'lg:col-span-2' : ''}`}>
                    <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse"></div>
                    <div className="h-72 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                </div>
            ))}
        </div>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView, theme }) => {
    const [stats, setStats] = useState({
        totalParticipants: 0,
        overallPreparedness: 0,
        drillsCompleted: 0,
    });
    const [participationData, setParticipationData] = useState<{ name: string; Drills: number }[]>([]);
    const [preparednessData, setPreparednessData] = useState<{ name: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const users = await authService.getAllUsers();
                const analytics = await analyticsService.getAnalytics();

                const overallPreparedness = analytics.overallQuestionSum > 0
                    ? Math.round((analytics.overallScoreSum / analytics.overallQuestionSum) * 100)
                    : 0;
                
                setStats({
                    totalParticipants: users.length,
                    drillsCompleted: analytics.totalDrillsCompleted,
                    overallPreparedness: overallPreparedness,
                });

                const participation = DISASTER_MODULES.map(module => ({
                    name: module.type,
                    Drills: analytics.drillsByType?.[module.type] || 0,
                }));
                setParticipationData(participation);

                const preparedness = DISASTER_MODULES.map(module => {
                    const data = analytics.scoresByType?.[module.type];
                    const value = data && data.questionSum > 0
                        ? Math.round((data.scoreSum / data.questionSum) * 100)
                        : 0;
                    return { name: module.type, value };
                }).filter(d => d.value > 0); // Only show disasters with data in pie chart
                setPreparednessData(preparedness);

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#5B5B5B';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipStyles = {
        contentStyle: { 
            backgroundColor: theme === 'dark' ? 'var(--dark-surface)' : 'var(--brand-white)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '1rem',
        },
        labelStyle: { color: theme === 'dark' ? 'var(--dark-text)' : 'var(--brand-charcoal)' }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[--brand-charcoal] sm:text-5xl dark:text-white">Admin Dashboard</h1>
            <p className="mt-4 text-lg text-[--brand-slate] dark:text-slate-400">Overview of campus disaster preparedness and student engagement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow flex items-center">
                <UsersIcon className="h-10 w-10 text-blue-500 mr-4"/>
                <div>
                    <p className="text-sm text-[--brand-slate] dark:text-slate-400">Total Participants</p>
                    <p className="text-2xl font-bold dark:text-white">{stats.totalParticipants}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow flex items-center">
                <ShieldCheckIcon className="h-10 w-10 text-green-500 mr-4"/>
                <div>
                    <p className="text-sm text-[--brand-slate] dark:text-slate-400">Overall Preparedness</p>
                    <p className="text-2xl font-bold dark:text-white">{stats.overallPreparedness}%</p>
                </div>
            </div>
             <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow flex items-center">
                <PresentationChartBarIcon className="h-10 w-10 text-yellow-500 mr-4"/>
                <div>
                    <p className="text-sm text-[--brand-slate] dark:text-slate-400">Drills Completed</p>
                    <p className="text-2xl font-bold dark:text-white">{stats.drillsCompleted}</p>
                </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow mb-8">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Admin Tools</h3>
            <button
                onClick={() => setView('registerInstitution')}
                className="bg-[--brand-orange] text-white font-semibold py-3 px-5 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 transform hover:-translate-y-0.5"
            >
                <AcademicCapIcon className="h-5 w-5" />
                Register New Institution
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Drill Participation by Disaster</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={participationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: tickColor, fontSize: 12 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyles} cursor={{fill: 'rgba(0,0,0,0.05)'}}/>
                    <Legend wrapperStyle={{ color: tickColor, fontSize: 14 }}/>
                    <Bar dataKey="Drills" fill="var(--brand-orange)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Avg. Preparedness Score</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={preparednessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {preparednessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} {...tooltipStyles} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-[--dark-surface] p-6 rounded-3xl soft-shadow col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Skill Competency (Static Demo)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                        <PolarGrid stroke={gridColor}/>
                        <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 14 }} />
                        <PolarRadiusAxis tick={{ fill: tickColor }} angle={30} domain={[0, 100]}/>
                        <Radar name="Campus Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip {...tooltipStyles} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;