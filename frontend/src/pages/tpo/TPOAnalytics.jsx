import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Briefcase, Users, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TPOAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('http://localhost:5000/api/tpo/analytics');
      setStats(res.data.data);
    };
    load();
  }, []);

  const handleDownload = () => {
    window.open('http://localhost:5000/api/tpo/export', '_blank');
  };

  const chartData = [
    { m: 'Aug', avg: 4.2 }, { m: 'Sep', avg: 5.1 }, { m: 'Oct', avg: 6.4 },
    { m: 'Nov', avg: 7.2 }, { m: 'Dec', avg: 8.5 }, { m: 'Jan', avg: 9.1 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Analytics Center</h1>
          <p className="text-slate-500">Review composite placement velocity and package mappings.</p>
        </div>
        <button onClick={handleDownload} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg">
          <Download size={18} /> Export Full Batch CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-[#1e3a8a] rounded-2xl"><Briefcase size={28} /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Ongoing Drives</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats?.activeDrives || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={28} /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Average Package (LPA)</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">₹{stats?.avgCTC || '0.00'}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl"><Users size={28} /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Students Active</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats?.totalTracked || 0}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-6">Package Trend Progression (Composite Index)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCTC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:12, fontWeight:600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8'}} unit=" L" />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.08)'}} 
                itemStyle={{color: '#1e3a8a', fontWeight: 700}}
              />
              <Area type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCTC)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TPOAnalytics;
