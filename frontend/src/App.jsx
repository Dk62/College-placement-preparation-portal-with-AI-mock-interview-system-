import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AptitudeTest from './pages/AptitudeTest';
import MockInterview from './pages/MockInterview';
import PlacementDrives from './pages/PlacementDrives';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';

// Consolidated Role Wrapper
import RoleLayout from './components/RoleLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Domain
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import QuestionManager from './pages/admin/QuestionManager';
import SystemLogs from './pages/admin/SystemLogs';

// TPO Domain
import TPOAnalytics from './pages/tpo/TPOAnalytics';
import CompanyApproval from './pages/tpo/CompanyApproval';
import DriveLifecycle from './pages/tpo/DriveLifecycle';
import StudentTracker from './pages/tpo/StudentTracker';
import BroadcastCenter from './pages/tpo/BroadcastCenter';

// Company Domain
import CompanyProfileView from './pages/company/CompanyProfile';
import DriveManager from './pages/company/DriveManager';
import RecruitmentATS from './pages/company/RecruitmentATS';

function App() {
  return (
    <Router>
      <Routes>
        {/* Standard Global Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="student-dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="aptitude-test" element={<AptitudeTest />} />
          <Route path="mock-interview" element={<MockInterview />} />
          <Route path="drives" element={<PlacementDrives />} />
          <Route path="resume-builder" element={<ResumeBuilder />} />
          <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        </Route>

        {/* Dark Administrative Secondary App Structure */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="questions" element={<QuestionManager />} />
          <Route path="logs" element={<SystemLogs />} />
        </Route>

        {/* White-Themed High-Efficiency TPO Command Tree */}
        <Route
          path="/tpo-panel"
          element={
            <ProtectedRoute allowedRoles={['TPO']}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TPOAnalytics />} />
          <Route path="companies" element={<CompanyApproval />} />
          <Route path="drives" element={<DriveLifecycle />} />
          <Route path="students" element={<StudentTracker />} />
          <Route path="broadcast" element={<BroadcastCenter />} />
        </Route>

        {/* Corporate Blue High-Impact HR Suite */}
        <Route
          path="/company-portal"
          element={
            <ProtectedRoute allowedRoles={['Company']}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CompanyProfileView />} />
          <Route path="drives" element={<DriveManager />} />
          <Route path="ats" element={<RecruitmentATS />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
