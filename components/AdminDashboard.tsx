import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { UsersIcon, ShieldCheckIcon, PresentationChartBarIcon, AcademicCapIcon, ArrowPathIcon } from './icons/Icons';
import { Theme, View, DisasterType } from '../types';
import * as authService from '../services/authService';
import * as analyticsService from '../services/analyticsService';
import { DISASTER_MODULES } from '../constants';

interface AdminDashboardProps {
  theme: Theme;
  setView: (view: View) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Placeholder data for the skills chart, which is not yet connected to dynamic data
const skillData = [
    { subject: 'Evacuation', A: 80, fullMark: 100 },
    { subject: 'First Aid', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 75, fullMark: 100 },
    { subject: 'Equipment Use', A: 65, fullMark: 100 },
    { subject: 'Risk Assessment', A: 85, fullMark: 100 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, setView }) => {
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
    
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const tooltipStyles = {
        contentStyle: { 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
        },
        labelStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937' }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
        );
    }

  return (
    <div>
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">Admin Dashboard</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Overview of campus disaster preparedness and student engagement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
                <UsersIcon className="h-10 w-10 text-blue-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Participants</p>
                    <p className="text-2xl font-bold dark:text-slate-100">{stats.totalParticipants}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
                <ShieldCheckIcon className="h-10 w-10 text-green-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Overall Preparedness</p>
                    <p className="text-2xl font-bold dark:text-slate-100">{stats.overallPreparedness}%</p>
                </div>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
                <PresentationChartBarIcon className="h-10 w-10 text-yellow-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Drills Completed</p>
                    <p className="text-2xl font-bold dark:text-slate-100">{stats.drillsCompleted}</p>
                </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Admin Tools</h3>
            <button
                onClick={() => setView('registerInstitution')}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <AcademicCapIcon className="h-5 w-5" />
                Register New Institution
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Drill Participation by Disaster</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor }} />
                    <YAxis tick={{ fill: tickColor }} allowDecimals={false} />
                    <Tooltip {...tooltipStyles} />
                    <Legend wrapperStyle={{ color: tickColor }}/>
                    <Bar dataKey="Drills" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Avg. Preparedness Score by Disaster</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={preparednessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                    >
                        {preparednessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} {...tooltipStyles} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Skill Competency Overview (Static Demo)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                        <PolarGrid stroke={gridColor}/>
                        <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor }} />
                        <PolarRadiusAxis tick={{ fill: tickColor }} />
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