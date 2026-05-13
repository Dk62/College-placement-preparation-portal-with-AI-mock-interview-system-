import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { User, Mail, Phone, MapPin, BookOpen, Briefcase, Award, Download } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get('http://localhost:5000/api/profiles/me');
        setProfile(res.data.data);
      } catch (err) {
        console.error('Error loading profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDownloadResume = async () => {
    try {
      window.open('http://localhost:5000/api/profiles/student/resume', '_blank');
    } catch (err) {
      alert('Failed to trigger download');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
      </div>
    );
  }

  const studentData = profile || {};

  return (
    <div className="max-w-5xl mx-auto mt-6 mb-12 px-4">
      {/* Header Banner Profile */}
      <div className="bg-white dark:bg-[#1f2028] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-[#2e303a]">
        <div className="h-32 bg-gradient-to-r from-[#1e3a8a] to-blue-500"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 relative">
          <div className="-mt-16">
            <div className="w-32 h-32 bg-white dark:bg-[#1f2028] rounded-2xl shadow-lg p-1 border border-gray-100 dark:border-[#2e303a] flex items-center justify-center">
              <div className="w-full h-full bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-[#1e3a8a] dark:text-blue-400">
                <User size={64} />
              </div>
            </div>
          </div>
          <div className="pt-4 flex-1 flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user?.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user?.role}
                </span>
                {studentData.branch && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">• {studentData.branch} Student</span>
                )}
              </div>
            </div>
            {user?.role === 'Student' && (
              <button 
                onClick={handleDownloadResume}
                className="mt-4 md:mt-0 flex items-center gap-2 bg-[#1e3a8a] dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-800 dark:hover:bg-blue-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download size={18} />
                Download Latest Resume
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Contact & Basic info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1f2028] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2e303a]">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-50 dark:border-gray-800">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-gray-50 dark:bg-[#16171d] rounded-lg"><Mail size={16} className="text-[#1e3a8a] dark:text-blue-400" /></div>
                <span className="text-sm break-all font-medium">{user?.email}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-gray-50 dark:bg-[#16171d] rounded-lg"><Phone size={16} className="text-[#1e3a8a] dark:text-blue-400" /></div>
                <span className="text-sm font-medium">{studentData.phone || 'Not provided'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <div className="p-2 bg-gray-50 dark:bg-[#16171d] rounded-lg"><MapPin size={16} className="text-[#1e3a8a] dark:text-blue-400" /></div>
                <span className="text-sm font-medium">{studentData.location || 'Not provided'}</span>
              </li>
            </ul>
          </div>

          {studentData.cgpa && (
            <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-900 dark:from-blue-900 dark:to-slate-900 rounded-2xl p-6 shadow-lg text-white text-center">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Current CGPA</p>
              <h2 className="text-5xl font-black mt-2">{studentData.cgpa}</h2>
              <div className="mt-4 w-full bg-white/20 dark:bg-black/20 h-2 rounded-full overflow-hidden">
                <div className="bg-green-400 dark:bg-green-500 h-full" style={{width: `${(studentData.cgpa / 10) * 100}%`}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Academic / Experience / Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Academics */}
          <div className="bg-white dark:bg-[#1f2028] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2e303a]">
            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-50 dark:border-gray-800">
              <BookOpen size={20} className="text-[#1e3a8a] dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Branch/Dept.</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{studentData.branch || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Enrollment No.</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{studentData.enrollment_no || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Degree</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{studentData.degree || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Year / Semester</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                  {studentData.academic_year ? `Year ${studentData.academic_year}` : '—'}
                  {studentData.current_semester ? ` / Sem ${studentData.current_semester}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-[#1f2028] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-[#2e303a]">
            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-50 dark:border-gray-800">
              <Award size={20} className="text-[#1e3a8a] dark:text-blue-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Technical Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {studentData.skills ? (
                Object.entries(studentData.skills).map(([category, skillString]) => {
                  if (!skillString) return null;
                  return skillString.split(',').map((skill, i) => (
                    <span key={`${category}-${i}`} className="px-4 py-2 bg-gray-50 dark:bg-[#16171d] hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-300 hover:text-[#1e3a8a] dark:hover:text-blue-400 border border-gray-100 dark:border-gray-700/50 rounded-lg text-sm font-medium transition-colors cursor-default capitalize">
                      {skill.trim()}
                    </span>
                  ));
                })
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No skills cataloged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
