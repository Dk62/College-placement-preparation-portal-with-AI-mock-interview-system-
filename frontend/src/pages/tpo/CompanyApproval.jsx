import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle, Building2 } from 'lucide-react';

const CompanyApproval = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const res = await axios.get('http://localhost:5000/api/tpo/companies');
    setList(res.data.data);
  };

  useEffect(() => { fetchList(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tpo/companies/${id}/approve`);
      toast.success('Company verified. Authorization key active.');
      fetchList();
    } catch (e) { toast.error('Sync failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Company Verification Stream</h1>
        <p className="text-slate-500">Approve pending enterprise registrants allowing drive generation.</p>
      </div>

      <div className="grid gap-4">
        {list.length === 0 && <div className="italic text-slate-400">Awaiting data stream...</div>}
        {list.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm transition-all hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {c.company_name}
                  {c.is_verified && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Verified</span>}
                </h3>
                <p className="text-sm text-slate-500">{c.website || 'No corporate URL'}</p>
              </div>
            </div>
            {!c.is_verified && (
              <button 
                onClick={() => handleApprove(c.id)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all"
              >
                <CheckCircle size={16} /> Authorize Link
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyApproval;
