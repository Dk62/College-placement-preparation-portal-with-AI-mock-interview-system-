import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Computer Science', placed: 120, total: 150 },
  { name: 'Information Tech', placed: 90, total: 110 },
  { name: 'Electronics', placed: 60, total: 100 },
];

const TPODashboard = () => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">360</p>
        </div>
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Placed Students</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">270</p>
        </div>
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Companies Visited</h3>
          <p className="text-3xl font-bold text-[#aa3bff] mt-2">45</p>
        </div>
        <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Drives</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">8</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
        <h3 className="text-xl font-bold mb-6">Placement Stats by Branch</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2028', borderColor: '#2e303a', color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#aa3bff" name="Total Eligible" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TPODashboard;
