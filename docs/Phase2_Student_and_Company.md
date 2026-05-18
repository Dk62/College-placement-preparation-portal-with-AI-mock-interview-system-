# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 2: Role-Based Dashboards
## Chapter 4: Student Dashboard & Corporate Portals

### 4.1 Overview and Purpose
Phase 2 delves into the Multi-Tenant Architecture of the platform. After a user successfully authenticates, the system utilizes their cryptographic role token to route them to a specialized interface tailored to their permissions. 
This chapter explores the heavily optimized **Student Dashboard** and the secure **Company Profile** mechanism.

---

### 4.2 The Student Dashboard (`StudentDashboard.jsx`)
The Student Dashboard acts as the primary telemetry interface for users. It uses `Recharts` for live data visualization and Axios interceptors for secure credential tracking.

#### 4.2.1 Source Code with Explanatory Comments
```jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data mock for the Data Visualization engine (Recharts)
const trendData = [
  { name: 'Mock 1', score: 65, accuracy: 70 },
  { name: 'Mock 2', score: 75, accuracy: 80 },
  { name: 'Mock 3', score: 85, accuracy: 90 },
];

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Extract user identity from Redux state
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Asynchronous Telemetry Fetching
    const fetchProfileData = async () => {
      try {
        // Securely fetch profile using HttpOnly JWT cookies (withCredentials: true)
        const res = await axios.get('http://localhost:5000/api/profiles/me', { withCredentials: true });
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false); // Disable spinner regardless of success/fail
      }
    };

    fetchProfileData();
  }, []);

  // ----------------------------------------------------
  // CONDITIONAL RENDERING MATRIX
  // ----------------------------------------------------
  
  // 1. Loading State UI (Tailwind Spinners)
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

  // 2. Profile Setup Gateway
  // If the backend returns null for profile, force the user to complete their resume first.
  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border shadow-sm mt-8">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-500 mb-6">You need to set up your student profile and generate a resume before accessing dashboard metrics.</p>
        <button 
          onClick={() => navigate('/resume-builder')}
          className="bg-[#1e3a8a] text-white px-6 py-3 rounded-lg font-bold"
        >
          Go to Resume Builder
        </button>
      </div>
    );
  }

  // 3. Main Operational Dashboard
  return (
    <div className="space-y-8">
      {/* Dynamic Action Ribbons for quick access */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <button onClick={() => navigate('/resume-builder')} className="...">Update Resume</button>
        <button onClick={() => navigate('/resume-analyzer')} className="...">AI Resume Analyzer</button>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Current CGPA</h3>
          <p className="text-4xl font-black text-[#1e3a8a] mt-2">{profile.cgpa || 'N/A'}</p>
        </div>
        {/* Additional Stats Omitted for Brevity in Code Block */}
      </div>

      {/* Advanced Recharts Visualization Engine */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Preparation Progress</h3>
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
              {/* Dual-axis comparative bar tracking */}
              <Bar dataKey="score" fill="#1e3a8a" name="AI Evaluation Score (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="accuracy" fill="#3b82f6" name="Aptitude Accuracy (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
```

---

### 4.3 Corporate Profile Configuration (`CompanyProfile.jsx`)
The Corporate Portal is governed by a strict Verification Matrix. Unlike students who have immediate access to all tools, Companies must undergo TPO (Training and Placement Officer) validation before they can launch recruitment drives.

#### 4.3.1 Security Context and UI Render Logic
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShieldCheck, ShieldAlert, Save } from 'lucide-react';

const CompanyProfile = () => {
  const [form, setForm] = useState({ company_name: '', description: '', website: '' });
  
  // High-Security verification flag mechanism
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/company/profile');
        if (res.data.data) {
          const p = res.data.data;
          setForm({ company_name: p.company_name, description: p.description || '', website: p.website || '' });
          
          // Lock state based on backend SQL flag 'is_verified'
          setVerified(p.is_verified);
        }
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 
        Dynamic Color-Coding Security Card:
        Turns Emerald (Green) when TPO verified, stays Amber (Yellow) when restricted.
      */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <div className={`p-8 flex-1 text-white flex flex-col justify-center ${verified ? 'bg-emerald-600' : 'bg-amber-500'}`}>
          <div className="mb-4">
            {/* Dynamic Lucide-React Icon toggle */}
            {verified ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          </div>
          <h2 className="text-2xl font-black">Verification Standard</h2>
          <p className="text-white/80 mt-1 text-sm">
            {verified ? 'Your profile holds fully validated clearance. Drive launches enabled.' : 'Your clearance level is pending TPO approval. Some modules are locked.'}
          </p>
        </div>
        
        {/* Profile Update Form */}
      </div>
    </div>
  );
};
```

### 4.4 Detailed Technical Breakdown

#### 4.4.1 Recharts Responsive SVG Mapping
In `StudentDashboard.jsx`, the system utilizes `<ResponsiveContainer>` wrapped around a `<BarChart>`. This is an advanced SVG manipulation technique. Instead of drawing static HTML canvas graphs, `Recharts` mathematically calculates SVG coordinates based on the active viewport width of the parent flexbox. This ensures the dashboard charts seamlessly scale from ultra-wide 4K monitors down to mobile phone screens without losing pixel fidelity.

#### 4.4.2 Conditional Rendering Pipelines
Both components utilize highly defensive conditional rendering:
1. `loading`: Prevents the component from rendering `undefined` states by showing an animated SVG spinner until Axios resolves the Promise.
2. `!profile`: Intercepts users who skipped onboarding and forces them to complete mandatory database fields (like Resume Generation). 
3. `verified`: In the Corporate Portal, this boolean flag fundamentally alters the UI design (changing CSS colors and icons via template literals like `${verified ? 'bg-emerald-600' : 'bg-amber-500'}`) to provide instant visual feedback on their permission tier.
