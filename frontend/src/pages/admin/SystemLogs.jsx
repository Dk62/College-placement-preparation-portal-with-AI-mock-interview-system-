import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileTerminal } from 'lucide-react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('http://localhost:5000/api/admin/logs');
      setLogs(res.data.data);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Immutable System Ledger</h1>
        <p className="text-slate-500 text-sm">Streaming chronological audit trails of administrative mutations.</p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs shadow-2xl border border-slate-800 min-h-[600px]">
        <div className="flex gap-2 items-center text-slate-500 border-b border-slate-800 pb-4 mb-4">
          <FileTerminal size={16} />
          <span>ROOT@LEDGER: tail -n 100 audit.log</span>
        </div>

        <div className="space-y-3 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className="flex gap-4 leading-relaxed border-b border-slate-800/50 pb-2">
              <span className="text-slate-600">[{new Date(l.createdAt).toLocaleTimeString()}]</span>
              <span className={`font-bold ${
                l.action_type === 'DELETE' ? 'text-red-500' : 
                l.action_type === 'CREATE' ? 'text-green-500' : 'text-blue-400'
              }`}>{l.action_type}</span>
              <span className="text-slate-400">ENTITY[{l.target_entity}]</span>
              <span className="text-slate-300 flex-1">{l.details}</span>
              <span className="text-indigo-400">BY: {l.AdminUser?.name}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-slate-600 italic">Waiting for system interrupt... no actions recorded.</p>}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
