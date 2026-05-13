import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Rocket } from 'lucide-react';

const DriveLifecycle = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    companyId: '', job_role: '', description: '',
    eligibility_cgpa: '6.5', eligibility_branch: 'CSE',
    package_lpa: '', drive_date: ''
  });

  useEffect(() => {
    const fetchComps = async () => {
      const res = await axios.get('http://localhost:5000/api/tpo/companies');
      // only verified companies can form drives
      setCompanies(res.data.data.filter(c => c.is_verified));
    };
    fetchComps();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tpo/drives', form);
      toast.success('Operation Synchronized. Live placement drive deployed!');
      setForm({ companyId: '', job_role: '', description: '', eligibility_cgpa: '6.5', eligibility_branch: 'CSE', package_lpa: '', drive_date: '' });
    } catch(err) { toast.error('Deployment aborted due to data-collision.'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Create Placement Directive</h1>
        <p className="text-slate-500">Initiate automatic student filtering by launching a new secure job drive.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Participating Enterprise</label>
              <select required className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                value={form.companyId} onChange={(e)=>setForm({...form, companyId: e.target.value})}>
                <option value="">Select Authorized Partner...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Target Designation</label>
              <input required type="text" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. SDE-I" value={form.job_role} onChange={(e)=>setForm({...form, job_role:e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Role Summary</label>
            <textarea required className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 h-24 resize-none font-medium"
              value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Cut-off CGPA</label>
              <input required type="number" step="0.1" className="w-full p-3 border rounded-xl font-medium"
                value={form.eligibility_cgpa} onChange={(e)=>setForm({...form, eligibility_cgpa:e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Primary Stream</label>
              <select className="w-full p-3 border rounded-xl font-medium"
                value={form.eligibility_branch} onChange={(e)=>setForm({...form, eligibility_branch:e.target.value})}>
                <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="BCA">BCA</option><option value="ALL">Composite (All)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Offer LPA</label>
              <input required type="number" step="0.5" className="w-full p-3 border rounded-xl font-medium"
                value={form.package_lpa} onChange={(e)=>setForm({...form, package_lpa:e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1.5">Tentative Date</label>
            <input required type="date" className="w-full p-3 border rounded-xl font-medium bg-slate-50"
              value={form.drive_date} onChange={(e)=>setForm({...form, drive_date:e.target.value})} />
          </div>

          <button type="submit" className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white py-4 rounded-2xl font-black text-lg shadow-glow-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5">
            <Rocket size={20} /> BROADCAST DRIVE LIVE
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriveLifecycle;
