import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, Mail, Info } from 'lucide-react';

const BroadcastCenter = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', targetBranch: 'All', sendMailToggle: true
  });

  const dispatchMsg = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/tpo/broadcast', form);
      toast.success(res.data.message);
      setForm({ title: '', content: '', targetBranch: 'All', sendMailToggle: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Broadcast Failure');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl space-y-6 mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dispatch Center</h1>
        <p className="text-slate-500">Release high-priority directives into visual notification cues and SMTP relays.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-slate-400 rotate-12"><Send size={120} /></div>

        <form onSubmit={dispatchMsg} className="space-y-6 relative z-10">
          <div className="grid grid-cols-3 gap-4 items-center">
            <label className="col-span-1 text-sm font-black text-slate-500 uppercase">Routing Scope</label>
            <select className="col-span-2 p-2.5 border rounded-xl font-bold text-slate-700 focus:ring-2 outline-none"
              value={form.targetBranch} onChange={(e)=>setForm({...form, targetBranch: e.target.value})}>
              <option value="All">Global Matrix (All Branches)</option>
              <option value="CSE">CSE Channel</option>
              <option value="ECE">ECE Channel</option>
              <option value="BCA">BCA Channel</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase">Headline</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:bg-white text-lg font-bold"
              placeholder="URGENT: Placement Registration Active" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-400 uppercase">Broadcast Payload</label>
            <textarea required className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:bg-white h-40 resize-none font-medium"
              placeholder="Enter the explicit instructions or message contents..."
              value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-white rounded-lg shadow-sm"><Mail className="text-blue-600" size={18} /></div>
              <div>
                <p className="text-sm font-bold text-slate-800">SMTP Mass Relay</p>
                <p className="text-[10px] text-slate-500 font-medium">Duplicate message payload to external personal emails.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.sendMailToggle} onChange={(e)=>setForm({...form, sendMailToggle: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-blue-600/20 transition-all">
            {loading ? 'INITIALIZING RELAY...' : <>DISPATCH MASS UPDATE <Send size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BroadcastCenter;
