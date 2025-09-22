import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { UsersIcon, ShieldCheckIcon, PresentationChartBarIcon, AcademicCapIcon } from './icons/Icons';
import { Theme, View } from '../types';

interface AdminDashboardProps {
  theme: Theme;
  setView: (view: View) => void;
}

const participationData = [
  { name: 'Earthquake', Drills: 400, 'Module Views': 2400 },
  { name: 'Flood', Drills: 300, 'Module Views': 1398 },
  { name: 'Fire', Drills: 500, 'Module Views': 9800 },
  { name: 'Cyclone', Drills: 278, 'Module Views': 3908 },
];

const preparednessData = [
  { name: 'Earthquake', value: 85 },
  { name: 'Flood', value: 65 },
  { name: 'Fire', value: 92 },
  { name: 'Cyclone', value: 75 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const skillData = [
    { subject: 'Evacuation', A: 80, fullMark: 100 },
    { subject: 'First Aid', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 75, fullMark: 100 },
    { subject: 'Equipment Use', A: 65, fullMark: 100 },
    { subject: 'Risk Assessment', A: 85, fullMark: 100 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, setView }) => {
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const tooltipStyles = {
        contentStyle: { 
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
        },
        labelStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937' }
    };

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
                    <p className="text-2xl font-bold dark:text-slate-100">1,250</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
                <ShieldCheckIcon className="h-10 w-10 text-green-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Overall Preparedness</p>
                    <p className="text-2xl font-bold dark:text-slate-100">82%</p>
                </div>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
                <PresentationChartBarIcon className="h-10 w-10 text-yellow-500 mr-4"/>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Drills Completed</p>
                    <p className="text-2xl font-bold dark:text-slate-100">1,478</p>
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
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Drill Participation & Module Views</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: tickColor }} />
                    <YAxis tick={{ fill: tickColor }} />
                    <Tooltip {...tooltipStyles} />
                    <Legend wrapperStyle={{ color: tickColor }}/>
                    <Bar dataKey="Drills" fill="#8884d8" />
                    <Bar dataKey="Module Views" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Preparedness Score by Disaster</h3>
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
                        label={({ name, percent }) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                    >
                        {preparednessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip {...tooltipStyles} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 dark:text-slate-100">Skill Competency Overview</h3>
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