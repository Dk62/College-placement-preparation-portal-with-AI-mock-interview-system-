# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 2: Role-Based Dashboards
## Chapter 5: Admin & TPO Analytics Centers

### 5.1 Overview and Purpose
The Administrative and Training Placement Officer (TPO) dashboards act as the absolute control centers of the application. Unlike student dashboards which focus on personal telemetry, these components aggregate massive amounts of system-wide data, rendering it through complex Area and Bar charts.

---

### 5.2 Platform Intelligence Dashboard (`AdminDashboard.jsx`)
The `AdminDashboard` is designed with an ultra-premium UI emphasizing System Integrity monitoring. It extracts network telemetry and maps it against a highly aesthetic dark-mode gradient status board.

#### 5.2.1 Core Architectural Implementation
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// =======================================================
// REUSABLE UI COMPONENT: STAT CARD
// =======================================================
// Dynamically accepts icons and Tailwind color tokens to generate identical cards
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
    {/* Decorative faded background icon */}
    <div className={`absolute -right-4 -bottom-4 opacity-5 ${color}`}>
      <Icon size={120} />
    </div>
    <div className="flex items-center justify-between mb-4">
      {/* Primary indicator icon */}
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

  // Poll server for aggregated SQL stats
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

  return (
    <div className="space-y-8">
      {/* Dynamic Grid Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="bg-blue-600" />
        <StatCard title="Partner Companies" value={stats?.registeredCompanies || 0} icon={Briefcase} color="bg-indigo-600" />
        <StatCard title="Active Drives" value={stats?.activeDrives || 0} icon={ArrowUpRight} color="bg-violet-600" />
        <StatCard title="System Audits" value={stats?.systemLogs || 0} icon={ShieldCheck} color="bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ... Recharts BarChart rendering department distribution ... */}

        {/* ======================================================= */}
        {/* SYSTEM INTEGRITY MODULE                                 */}
        {/* ======================================================= */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">System Integrity</h3>
            {/* Live Ping Indicator CSS Animation */}
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### 5.3 TPO Operations Command (`TPOAnalytics.jsx`)
The TPO Panel relies heavily on SVG data manipulation. Using Recharts, it paints a fluid `AreaChart` mapping out salary progressions mathematically. It also integrates an automated PDF/CSV Export pipeline hook.

#### 5.3.1 SVG Area Charting and Export Handlers
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Briefcase, Users, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TPOAnalytics = () => {
  const [stats, setStats] = useState(null);

  // Execute external API download
  const handleDownload = () => {
    // Spawns a new tab instructing the browser to instantly parse binary CSV data
    window.open('http://localhost:5000/api/tpo/export', '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Analytics Center</h1>
        </div>
        {/* Export Trigger */}
        <button onClick={handleDownload} className="...">
          <Download size={18} /> Export Full Batch CSV
        </button>
      </div>

      {/* ======================================================= */}
      {/* GRADIENT SVG AREA CHART                                */}
      {/* ======================================================= */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              {/* Complex SVG Gradient Definition Layer */}
              <defs>
                <linearGradient id="colorCTC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} unit=" L" />
              {/* Data mapping to SVG Path */}
              <Area type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCTC)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
```

### 5.4 Detailed Technical Breakdown

#### 5.4.1 Modular `StatCard` Component Injection
In the `AdminDashboard`, instead of repeating HTML 4 times for the 4 status boxes, the code utilizes a pure functional React component `StatCard`. 
By passing `icon={Users}` as a direct prop, the `StatCard` dynamically injects the `lucide-react` SVG icon into both the foreground and a massive 120px absolute-positioned faded background element. This drastically reduces React DOM overhead.

#### 5.4.2 SVG Gradient Injection (`<defs>`)
In the `TPOAnalytics` chart, standard CSS `linear-gradient` cannot be applied to `AreaChart` paths because they are raw SVGs. 
To solve this, the code embeds an SVG `<defs>` dictionary inside the component:
```xml
<linearGradient id="colorCTC" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
</linearGradient>
```
It then maps this specific memory ID `fill="url(#colorCTC)"` to the `Area` component. This calculates a mathematically perfect color fade from deep blue at the chart's peaks down to absolute transparency at the zero-axis, achieving a premium dashboard aesthetic.
