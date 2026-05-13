import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Award, Brain } from 'lucide-react';

const StudentTracker = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('http://localhost:5000/api/tpo/students/readiness');
      setData(res.data.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Composite Student Readiness Grid</h1>
        <p className="text-slate-500">Detailed snapshot of academic performance linked with internal AI-interview signals.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-xs">Identification</th>
              <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-xs">Core Score (CGPA)</th>
              <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-xs">AI Readiness</th>
              <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-xs">Test Composite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? <tr><td colSpan="4" className="p-10 text-center italic text-slate-400">Defragmenting data shards...</td></tr> : 
             data.map(s => {
               // Calculate averages if multiple test records exist
               const avgTest = s.TestResults?.length > 0 ? (s.TestResults.reduce((a, b)=> a+b.score, 0) / s.TestResults.length).toFixed(1) : 'N/A';
               const avgAI = s.MockSessions?.length > 0 ? (s.MockSessions.reduce((a, b)=> a+ (parseFloat(b.overall_score)||0), 0) / s.MockSessions.length).toFixed(1) : 'N/A';

               return (
                 <tr key={s.id} className="hover:bg-slate-50/50">
                   <td className="px-6 py-4">
                     <div className="font-black text-slate-900">{s.User?.name}</div>
                     <div className="text-xs text-slate-400">{s.branch} • {s.User?.email}</div>
                   </td>
                   <td className="px-6 py-4">
                      <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">{s.cgpa || '0.0'}</span>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Brain size={14} className="text-violet-500" /> 
                        {avgAI !== 'N/A' ? `${avgAI}/10` : 'No Data'}
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Award size={14} className="text-amber-500" /> 
                        {avgTest !== 'N/A' ? `${avgTest}%` : 'No Data'}
                      </div>
                   </td>
                 </tr>
               );
             })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTracker;
