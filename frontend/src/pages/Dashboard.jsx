import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import TPODashboard from '../components/dashboards/TPODashboard';
import CompanyDashboard from '../components/dashboards/CompanyDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-200 dark:border-[#2e303a] pb-4">
        {user.role} Dashboard
      </h1>
      
      {user.role === 'Student' && <StudentDashboard />}
      {user.role === 'TPO' && <TPODashboard />}
      {user.role === 'Company' && <CompanyDashboard />}
      {user.role === 'Admin' && <TPODashboard /> /* For simplicity, Admin shares TPO view */}
    </div>
  );
};

export default Dashboard;
