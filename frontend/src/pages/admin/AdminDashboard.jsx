import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
    <div className={`absolute -right-4 -bottom-4 opacity-5 ${color}`}>
      <Icon size={120} />
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl text-white ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
        <ArrowUpRight size={14} /> Live
      </span>
    </div>
    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">{title}</h3>
    <p className="text-4xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Stats fetch err', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const demoChartData = [
    { name: 'CSE', placed: 45, pending: 20 },
    { name: 'ECE', placed: 32, pending: 15 },
    { name: 'MCA', placed: 18, pending: 30 },
    { name: 'BCA', placed: 50, pending: 10 },
  ];

  if (loading) return <div className="animate-pulse text-center mt-20 font-bold text-slate-500">Synchronizing telemetry systems...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Platform Intelligence</h1>
        <p className="text-slate-500 mt-1">Overview of platform nodes and operational statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="bg-blue-600" />
        <StatCard title="Partner Companies" value={stats?.registeredCompanies || 0} icon={Briefcase} color="bg-indigo-600" />
        <StatCard title="Active Drives" value={stats?.activeDrives || 0} icon={ArrowUpRight} color="bg-violet-600" />
        <StatCard title="System Audits" value={stats?.systemLogs || 0} icon={ShieldCheck} color="bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Department Distribution Metrics</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="placed" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Placed" />
                <Bar dataKey="pending" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">System Integrity</h3>
            <div className="flex items-center gap-2 text-green-400 text-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Online - Latency {'<'} 12ms
            </div>

            <ul className="space-y-4">
              <li className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400 text-sm">Database Engine</span>
                <span className="font-bold text-sm">MySQL Cluster</span>
              </li>
              <li className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400 text-sm">Auth Module</span>
                <span className="font-bold text-sm">JWT 256</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 text-sm">AI API Status</span>
                <span className="font-bold text-sm text-blue-400">Gemini-Flash</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mt-8">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Memory Utilization</p>
            <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '24%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
