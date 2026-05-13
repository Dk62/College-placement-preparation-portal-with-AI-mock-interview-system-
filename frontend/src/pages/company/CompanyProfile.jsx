import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShieldCheck, ShieldAlert, Save } from 'lucide-react';

const CompanyProfile = () => {
  const [form, setForm] = useState({ company_name: '', description: '', website: '' });
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/company/profile');
        if (res.data.data) {
          const p = res.data.data;
          setForm({ company_name: p.company_name, description: p.description || '', website: p.website || '' });
          setVerified(p.is_verified);
        }
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/company/profile', form);
      toast.success('Corporate identification updated successfully.');
    } catch (e) { toast.error('Write process interrupted.'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <div className={`p-8 flex-1 text-white flex flex-col justify-center ${verified ? 'bg-emerald-600' : 'bg-amber-500'}`}>
          <div className="mb-4">
            {verified ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          </div>
          <h2 className="text-2xl font-black">Verification Standard</h2>
          <p className="text-white/80 mt-1 text-sm">
            {verified ? 'Your profile holds fully validated clearance. Drive launches enabled.' : 'Your clearance level is pending TPO approval. Some modules are locked.'}
          </p>
        </div>

        <form onSubmit={handleSave} className="flex-[2] p-8 bg-white space-y-4">
          <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-4">General Intelligence</h3>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Corporate Title</label>
            <input required className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={form.company_name} onChange={(e)=>setForm({...form, company_name:e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Website/URL</label>
            <input type="url" className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              value={form.website} onChange={(e)=>setForm({...form, website:e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-1">Entity Mission/Description</label>
            <textarea className="w-full p-2.5 border rounded-xl h-24 resize-none focus:ring-2 focus:ring-blue-500"
              value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/10">
            <Save size={18} /> Synchronize Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
