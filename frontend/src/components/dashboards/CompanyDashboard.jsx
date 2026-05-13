const CompanyDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Drives Posted</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">4</p>
        </div>
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Applications</h3>
          <p className="text-3xl font-bold text-[#aa3bff] mt-2">142</p>
        </div>
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Shortlisted Candidates</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">35</p>
        </div>
      </div>

      {/* Recent Drives Section */}
      <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Your Recent Drives</h3>
          <button className="bg-[#aa3bff] hover:bg-[#902bd9] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Post New Drive
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#2e303a] text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4 rounded-tl-lg font-medium">Job Role</th>
                <th className="p-4 font-medium">Eligibility</th>
                <th className="p-4 font-medium">Applicants</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 rounded-tr-lg font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2e303a]">
              <tr className="hover:bg-gray-50 dark:hover:bg-[#2e303a]/50 transition-colors">
                <td className="p-4 font-medium">Software Engineer</td>
                <td className="p-4">CGPA 8.0+</td>
                <td className="p-4">85</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">Active</span></td>
                <td className="p-4"><button className="text-[#aa3bff] font-medium hover:underline">View Applicants</button></td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#2e303a]/50 transition-colors">
                <td className="p-4 font-medium">Data Analyst</td>
                <td className="p-4">CGPA 7.5+</td>
                <td className="p-4">57</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 rounded-full text-xs font-medium">Closed</span></td>
                <td className="p-4"><button className="text-[#aa3bff] font-medium hover:underline">View Applicants</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
