import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get(`http://localhost:5000/api/admin/users?search=${search}&role=${role}`);
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(delay);
  }, [search, role]);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`CRITICAL WARNING: Proceed to permanently purge the node for ${email}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      toast.success('User purged from main server cluster');
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Purge request denied');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Node Operations Directory</h1>
          <p className="text-slate-500 text-sm">Universal grid representing all synchronized users.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID, Email or Name..."
              value={search} onChange={(e)=>setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select 
            value={role} onChange={(e)=>setRole(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none"
          >
            <option value="">All Entities</option>
            <option value="Student">Students</option>
            <option value="Company">Companies</option>
            <option value="TPO">TPOs</option>
            <option value="Admin">Root Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">System Node Identity</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Privilege Access</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Creation Epoch</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Querying index database...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold">No matching records found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-slate-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'Student' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'Admin' ? (
                      <button 
                        onClick={()=>handleDelete(user.id, user.email)}
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all inline-flex items-center gap-1"
                        title="Purge Entity"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span className="text-slate-300"><ShieldAlert size={16} /></span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
