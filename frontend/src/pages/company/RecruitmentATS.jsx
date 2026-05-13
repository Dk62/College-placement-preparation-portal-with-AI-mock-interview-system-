import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, FileDown, Edit3 } from 'lucide-react';

const RecruitmentATS = () => {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDrives = async () => {
      const res = await axios.get('http://localhost:5000/api/company/drives');
      setDrives(res.data.data);
      if (res.data.data.length > 0) setSelectedDrive(res.data.data[0].id);
    };
    loadDrives();
  }, []);

  const fetchApps = async () => {
    if (!selectedDrive) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/company/drives/${selectedDrive}/applications`);
      setApps(res.data.data);
    } catch (e) { }
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [selectedDrive]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/company/applications/${appId}/status`, { status: newStatus });
      toast.success(`Candidature mapped to ${newStatus}`);
      fetchApps();
    } catch (e) { toast.error('State write violation'); }
  };

  const downloadOffer = (appId) => {
    window.open(`http://localhost:5000/api/company/applications/${appId}/offer`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Applicant Tracking System</h1>
          <p className="text-slate-500 text-sm">Filter nodes by initiative directives and mutate states.</p>
        </div>
        <div className="w-64">
          <label className="block text-xs font-black text-slate-400 uppercase mb-1">Select Operation Container</label>
          <select className="w-full p-2.5 bg-white border rounded-xl outline-none font-bold text-sm text-slate-800"
            value={selectedDrive} onChange={(e)=>setSelectedDrive(e.target.value)}>
            {drives.map(d => <option key={d.id} value={d.id}>{d.job_role}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Applicant Candidate</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Stream & Stats</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs">Candidature State</th>
              <th className="px-6 py-4 font-black text-slate-500 uppercase text-xs text-right">Directive Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? <tr><td colSpan="4" className="p-10 text-center italic text-slate-400">Syncing datasets...</td></tr> :
             apps.length === 0 ? <tr><td colSpan="4" className="p-10 text-center text-slate-400">No synchronized applications for this scope.</td></tr> :
             apps.map(a => (
               <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">{a.StudentProfile?.User?.name?.charAt(0)}</div>
                     <div>
                       <div className="font-black text-slate-900">{a.StudentProfile?.User?.name}</div>
                       <div className="text-xs text-slate-400">{a.StudentProfile?.User?.email}</div>
                     </div>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className="text-slate-700 text-xs font-bold">{a.StudentProfile?.branch} Branch</div>
                   <div className="text-[10px] text-blue-600 font-black mt-0.5">CGPA: {a.StudentProfile?.cgpa || 'N/A'}</div>
                 </td>
                 <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                     a.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                     a.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                   }`}>
                     {a.status}
                   </span>
                 </td>
                 <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                   {a.status === 'Selected' ? (
                     <button onClick={()=>downloadOffer(a.id)} className="flex items-center gap-1 text-[11px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all shadow-md">
                       <FileDown size={12}/> EXPORT OFFER
                     </button>
                   ) : (
                     <select 
                       className="text-xs font-black text-slate-600 border border-slate-200 rounded-lg px-2 py-1 outline-none bg-white hover:border-blue-300"
                       value={a.status}
                       onChange={(e)=>updateStatus(a.id, e.target.value)}
                     >
                       <option value="Applied">Applied</option>
                       <option value="Shortlisted">Shortlisted</option>
                       <option value="Selected">Selected</option>
                       <option value="Rejected">Rejected</option>
                     </select>
                   )}
                 </td>
               </tr>
             ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecruitmentATS;
