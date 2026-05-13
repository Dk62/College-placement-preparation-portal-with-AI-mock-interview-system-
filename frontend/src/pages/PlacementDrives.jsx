import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PlacementDrives = () => {
  const { user } = useSelector((state) => state.auth);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/drives', { withCredentials: true });
        if (response.data.success) {
          setDrives(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch drives', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    setMessage(null);
    try {
      const response = await axios.post(`http://localhost:5000/api/drives/${driveId}/apply`, {}, { withCredentials: true });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Successfully applied to the drive!' });
      }
    } catch (error) {
      console.error('Apply error:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to apply. Make sure your profile is complete.' 
      });
    } finally {
      setApplyingId(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 relative">
      
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-24 right-8 p-4 rounded-lg shadow-lg z-50 animate-bounce ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
        }`}>
          <p className="font-bold">{message.type === 'success' ? 'Success' : 'Error'}</p>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Placement Drives</h1>
          <p className="text-gray-500 mt-1">Explore and apply for the latest job opportunities.</p>
        </div>
        
        {user?.role !== 'Student' && (
          <button className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors">
            Post New Drive
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-[#1e3a8a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-gray-500">No active placement drives available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div key={drive.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
              <div className="h-2 bg-gradient-to-r from-[#1e3a8a] to-blue-500"></div>
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {drive.CompanyProfile?.company_name || 'Unknown Company'}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    drive.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : drive.status === 'Completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {drive.status || 'Upcoming'}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{drive.job_role}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{drive.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Min CGPA: <span className="font-semibold text-gray-900 dark:text-gray-200 ml-1">{drive.eligibility_cgpa}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    Branches: <span className="font-semibold text-gray-900 dark:text-gray-200 ml-1 text-xs">{drive.eligibility_branch}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Drive Date: <span className="font-semibold text-gray-900 dark:text-gray-200 ml-1">{new Date(drive.drive_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 mt-auto">
                {user?.role === 'Student' ? (
                  <button 
                    onClick={() => handleApply(drive.id)}
                    disabled={applyingId === drive.id}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-70 flex justify-center items-center"
                  >
                    {applyingId === drive.id ? 'Applying...' : 'Apply Now'}
                  </button>
                ) : (
                  <button className="w-full bg-white dark:bg-slate-800 border border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 py-2 rounded-lg font-bold transition-all">
                    Manage Applicants
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
