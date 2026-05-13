import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Trend data (Can be replaced with API data later)
const trendData = [
  { name: 'Mock 1', score: 65, accuracy: 70 },
  { name: 'Mock 2', score: 75, accuracy: 80 },
  { name: 'Mock 3', score: 85, accuracy: 90 },
];

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch Profile
        const res = await axios.get('http://localhost:5000/api/profiles/me', { withCredentials: true });
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <svg className="animate-spin h-10 w-10 text-[#1e3a8a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // If profile doesn't exist, prompt them to create it
  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700 shadow-sm mt-8">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-500 mb-6">You need to set up your student profile and generate a resume before accessing dashboard metrics.</p>
        <button 
          onClick={() => navigate('/resume-builder')}
          className="bg-[#1e3a8a] text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md"
        >
          Go to Resume Builder
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={() => navigate('/resume-builder')} 
          className="bg-white dark:bg-slate-800 border-2 border-[#1e3a8a] text-[#1e3a8a] dark:text-blue-400 hover:bg-[#1e3a8a] hover:text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Update Resume
        </button>
        <button 
          onClick={() => navigate('/resume-analyzer')} 
          className="bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          AI Resume Analyzer
        </button>
        <button 
          onClick={() => navigate('/drives')} 
          className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          View Job Drives
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Current CGPA</h3>
          <p className="text-4xl font-black text-[#1e3a8a] dark:text-blue-400 mt-2">{profile.cgpa || 'N/A'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Degree & Branch</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-2 leading-tight">{profile.degree || 'B.Tech'}</p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{profile.branch || 'Not specified'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Active Applications</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-2">2</p>
          <p className="text-xs text-green-500 font-medium mt-1">In progress</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-center">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Mock Interviews</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-2">3</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Completed this month</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Preparation Progress
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Legend />
              <Bar dataKey="score" fill="#1e3a8a" name="AI Evaluation Score (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accuracy" fill="#3b82f6" name="Aptitude Accuracy (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
