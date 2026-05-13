import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, Lock, Bell, UserCheck } from 'lucide-react';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  // Tab 1: Contact Form
  const [contactForm, setContactForm] = useState({
    email: user?.email || '',
    phone: '',
    location: ''
  });
  
  // Tab 2: Password Form
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const onContactChange = (e) => setContactForm({...contactForm, [e.target.name]: e.target.value});
  const onPwdChange = (e) => setPwdForm({...pwdForm, [e.target.name]: e.target.value});

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.put('http://localhost:5000/api/users/update-settings', contactForm);
      toast.success(res.data.message || 'Settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (pwdForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      toast.success(res.data.message);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all text-left border-l-4 ${
        activeTab === id 
          ? 'bg-blue-50 dark:bg-blue-950/30 text-[#1e3a8a] dark:text-blue-400 border-[#1e3a8a] dark:border-blue-400' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#16171d]/50 border-transparent'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400 rounded-2xl"><SettingsIcon size={24} /></div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your contact info and security preferences.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f2028] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-[#2e303a] min-h-[500px]">
        {/* Sidebar Navigation */}
        <div className="md:w-64 bg-gray-50 dark:bg-[#16171d]/30 border-r border-gray-100 dark:border-[#2e303a] py-6 flex flex-col">
          <TabButton id="profile" label="Profile Sync" icon={UserCheck} />
          <TabButton id="password" label="Security & Password" icon={Lock} />
          <TabButton id="notifications" label="Preferences" icon={Bell} />
        </div>

        {/* Content Render Panel */}
        <div className="flex-1 p-8 lg:p-12 bg-white dark:bg-[#1f2028]">
          
          {/* TAB 1: Profile Sync */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-50 dark:border-gray-800">Contact Synchronizer</h2>
              <form onSubmit={handleContactSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" name="email" value={contactForm.email} onChange={onContactChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="text" name="phone" value={contactForm.phone} onChange={onContactChange}
                    placeholder="E.g. +91..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Location/City</label>
                  <input 
                    type="text" name="location" value={contactForm.location} onChange={onContactChange}
                    placeholder="City, State"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[#1e3a8a] dark:bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-800 dark:hover:bg-blue-500 transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? 'Saving changes...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Password Change */}
          {activeTab === 'password' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-50 dark:border-gray-800">Change Password</h2>
              <form onSubmit={handlePwdSubmit} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                  <input 
                    type="password" name="currentPassword" value={pwdForm.currentPassword} onChange={onPwdChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" name="newPassword" value={pwdForm.newPassword} onChange={onPwdChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input 
                    type="password" name="confirmPassword" value={pwdForm.confirmPassword} onChange={onPwdChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16171d] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-red-600 dark:bg-red-700 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-red-700 dark:hover:bg-red-600 transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? 'Processing...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Preferences */}
          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-50 dark:border-gray-800">System Notifications</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16171d]/50 rounded-xl border border-gray-100 dark:border-[#2e303a]">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">In-App Popup Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Alerts on drive openings and shortcuts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a] dark:peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16171d]/50 rounded-xl border border-gray-100 dark:border-[#2e303a] opacity-60 pointer-events-none">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">Email Reports <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded uppercase">Pro</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Periodic analytical summary of placement stats</p>
                  </div>
                  <label className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
