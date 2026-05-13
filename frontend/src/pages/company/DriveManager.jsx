import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Lock, Calendar, UserCheck } from 'lucide-react';

const DriveManager = () => {
  const [drives, setDrives] = useState([]);
  const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    job_role: '', description: '', package_lpa: '', eligibility_cgpa: '6.0', eligibility_branch: 'CSE', drive_date: ''
  });

  const fetchDrives = async () => {
    const res = await axios.get('http://localhost:5000/api/company/drives');
    setDrives(res.data.data);
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const pRes = await axios.get('http://localhost:5000/api/company/profile');
        setVerified(pRes.data.data?.is_verified || false);
        fetchDrives();
      } catch (e) {}
    };
    fetchInfo();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/company/drives', form);
      toast.success('Deployment protocol successful. Drive live.');
      setOpen(false);
      fetchDrives();
    } catch (e) { toast.error(e.response?.data?.message || 'Drive broadcast aborted.'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Drive Management Hub</h1>
          <p className="text-slate-500 text-sm">Control active hiring flows and monitor active directives.</p>
        </div>
        {verified ? (
          <button onClick={()=>setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
            <Plus size={18} /> Spawn Launch Sequence
          </button>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
            <Lock size={16} /> Verification Blockade
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.length === 0 && <div className="text-slate-400 italic">No active operations logged.</div>}
        {drives.map(d => (
          <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-blue-600 w-full"></div>
            <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{d.job_role}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mb-4 flex items-center gap-1"><Calendar size={12}/> {new Date(d.drive_date).toLocaleDateString()}</p>
            
            <div className="space-y-2 border-t border-slate-50 pt-4 mb-4">
              <div className="flex justify-between text-xs"><span className="text-slate-500">LPA Target:</span> <span className="font-bold text-slate-800">₹{d.package_lpa} L</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">CGPA Threshold:</span> <span className="font-bold text-slate-800">{d.eligibility_cgpa}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Target Area:</span> <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{d.eligibility_branch}</span></div>
            </div>
            
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-[10px] font-black px-2 py-1 bg-green-50 text-green-700 rounded-full uppercase border border-green-100">Live Pipeline</span>
            </div>
          </div>
        ))}
      </div>

      {/* LAUNCH MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><UserCheck className="text-blue-600"/> Establish Drive Profile</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Operational Title (Role)</label>
                <input required className="w-full p-2.5 border rounded-xl" value={form.job_role} onChange={(e)=>setForm({...form, job_role:e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Package (LPA)</label>
                  <input required type="number" step="0.1" className="w-full p-2.5 border rounded-xl" value={form.package_lpa} onChange={(e)=>setForm({...form, package_lpa:e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Launch Schedule</label>
                  <input required type="date" className="w-full p-2.5 border rounded-xl" value={form.drive_date} onChange={(e)=>setForm({...form, drive_date:e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Min CGPA</label>
                  <input required type="number" step="0.1" className="w-full p-2.5 border rounded-xl" value={form.eligibility_cgpa} onChange={(e)=>setForm({...form, eligibility_cgpa:e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Eligibility Array</label>
                  <select className="w-full p-2.5 border rounded-xl" value={form.eligibility_branch} onChange={(e)=>setForm({...form, eligibility_branch:e.target.value})}>
                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="ALL">Composite</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Requirement Brief</label>
                <textarea required className="w-full p-2.5 border rounded-xl h-20" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
              </div>
              
              <div className="flex gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={()=>setOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Abort</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all">Initialize Directive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveManager;
