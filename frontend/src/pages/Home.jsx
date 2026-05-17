import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 sm:px-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#aa3bff] to-[#6b21a8] px-2">
        Welcome to College Placement Preparation Portal
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
        Your one-stop destination for campus placements, AI-powered mock interviews,
        and skill assessments. Land your dream job with us.
      </p>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link to="/dashboard" className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2e303a] hover:-translate-y-1 transition-transform">
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400">View your analytics and progress.</p>
          </Link>
          <Link to="/mock-interview" className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2e303a] hover:-translate-y-1 transition-transform">
            <h2 className="text-2xl font-bold mb-2 text-[#aa3bff]">AI Mock Interview</h2>
            <p className="text-gray-500 dark:text-gray-400">Practice with our Gemini-powered AI.</p>
          </Link>
          <Link to="/drives" className="bg-white dark:bg-[#1f2028] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2e303a] hover:-translate-y-1 transition-transform">
            <h2 className="text-2xl font-bold mb-2">Placement Drives</h2>
            <p className="text-gray-500 dark:text-gray-400">Apply to the latest job openings.</p>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0 justify-center">
          <Link to="/register" className="bg-[#aa3bff] hover:bg-[#902bd9] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
            Get Started
          </Link>
          <Link to="/login" className="bg-white dark:bg-[#1f2028] text-gray-800 dark:text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl border border-gray-200 dark:border-[#2e303a] transition-all w-full sm:w-auto">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
