# College Placement Preparation Portal
## Full Source Code Documentation — Volume 4
### Frontend Application Layer: Routing, Layout & Navigation

---

## 4.1 Application Entry Point & Complete Routing Map (`frontend/src/App.jsx`)

**Purpose:** `App.jsx` is the **root routing manifest** of the entire frontend application. It defines every URL path and maps it to a React component. It organizes the application into 4 distinct structural trees, each with their own layout wrapper and access control.

### Full Source Code
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleLayout from './components/RoleLayout';

// ─────────────── Public Pages ───────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Contact from './pages/Contact';

// ─────────────── Student Pages ───────────────
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AptitudeTest from './pages/AptitudeTest';
import MockInterview from './pages/MockInterview';
import PlacementDrives from './pages/PlacementDrives';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

// ─────────────── Admin Domain ───────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import QuestionManager from './pages/admin/QuestionManager';
import SystemLogs from './pages/admin/SystemLogs';

// ─────────────── TPO Domain ───────────────
import TPOAnalytics from './pages/tpo/TPOAnalytics';
import CompanyApproval from './pages/tpo/CompanyApproval';
import DriveLifecycle from './pages/tpo/DriveLifecycle';
import StudentTracker from './pages/tpo/StudentTracker';
import BroadcastCenter from './pages/tpo/BroadcastCenter';

// ─────────────── Company Domain ───────────────
import CompanyProfileView from './pages/company/CompanyProfile';
import DriveManager from './pages/company/DriveManager';
import RecruitmentATS from './pages/company/RecruitmentATS';

function App() {
  return (
    <Router>
      <Routes>

        {/* TREE 1: Global Layout (Navbar + Footer) — Public + Student routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
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

        {/* TREE 2: Admin Control Panel — Protected (Admin only) + Sidebar Layout */}
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

        {/* TREE 3: TPO Command Panel — Protected (TPO only) + Sidebar Layout */}
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

        {/* TREE 4: Company HR Suite — Protected (Company only) + Sidebar Layout */}
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
```

### Complete URL Route Reference Table

| URL Path | Component | Layout | Auth Required |
|----------|-----------|--------|---------------|
| `/` | `Home` | Global (Navbar+Footer) | No |
| `/login` | `Login` | Global | No |
| `/register` | `Register` | Global | No |
| `/forgot-password` | `ForgotPassword` | Global | No |
| `/about` | `About` | Global | No |
| `/contact` | `Contact` | Global | No |
| `/dashboard` | `Dashboard` | Global | No (checks internally) |
| `/profile` | `Profile` | Global | No |
| `/settings` | `Settings` | Global | No |
| `/aptitude-test` | `AptitudeTest` | Global | No |
| `/mock-interview` | `MockInterview` | Global | No |
| `/drives` | `PlacementDrives` | Global | No |
| `/resume-builder` | `ResumeBuilder` | Global | Student only |
| `/resume-analyzer` | `ResumeAnalyzer` | Global | Student only |
| `/admin` | `AdminDashboard` | Sidebar (Admin) | Admin only |
| `/admin/users` | `UserManagement` | Sidebar (Admin) | Admin only |
| `/admin/questions` | `QuestionManager` | Sidebar (Admin) | Admin only |
| `/admin/logs` | `SystemLogs` | Sidebar (Admin) | Admin only |
| `/tpo-panel` | `TPOAnalytics` | Sidebar (TPO) | TPO only |
| `/tpo-panel/companies` | `CompanyApproval` | Sidebar (TPO) | TPO only |
| `/tpo-panel/drives` | `DriveLifecycle` | Sidebar (TPO) | TPO only |
| `/tpo-panel/students` | `StudentTracker` | Sidebar (TPO) | TPO only |
| `/tpo-panel/broadcast` | `BroadcastCenter` | Sidebar (TPO) | TPO only |
| `/company-portal` | `CompanyProfile` | Sidebar (Company) | Company only |
| `/company-portal/drives` | `DriveManager` | Sidebar (Company) | Company only |
| `/company-portal/ats` | `RecruitmentATS` | Sidebar (Company) | Company only |

---

## 4.2 Route Guard: `ProtectedRoute.jsx`

**Purpose:** A React Higher-Order Component (HOC) that intercepts navigation to protected routes. If a user is not authenticated or lacks the correct role, they are silently redirected.

### Full Source Code
```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Higher-order component that restricts access based on:
 * 1. Authentication status (is user logged in?)
 * 2. Role clearance (does user have the required role?)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Guard 1: Not logged in → redirect to login, but remember where they were going
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Guard 2: Wrong role → silently redirect to homepage
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Clearance granted → render the protected component
  return children;
};

export default ProtectedRoute;
```

**Usage in App.jsx:**
```jsx
<ProtectedRoute allowedRoles={['Admin']}>
  <RoleLayout />
</ProtectedRoute>
```
The `state={{ from: location }}` prop on `<Navigate>` stores the user's intended path. After login, the app can redirect them back to where they originally wanted to go.

---

## 4.3 Role-Based Sidebar Layout (`RoleLayout.jsx`)

**Purpose:** A unified, data-driven sidebar layout that dynamically reconfigures itself based on the authenticated user's role. The same JSX component renders a completely different navigation tree for Admin, TPO, or Company users. It uses React Router's `<Outlet />` to render child route components inside the content area.

### Full Source Code
```jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Users, BookOpen, ShieldAlert,
  LineChart, CheckCircle2, Briefcase, Megaphone,
  Building2, FileText, LogOut, Home, Bell, Menu, X
} from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import ThemeToggle from './ThemeToggle';

const RoleLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Data-driven nav configuration for each role
  const roleConfigs = {
    Admin: {
      title: "Admin Matrix",
      badge: "Root User",
      icon: ShieldAlert,
      nav: [
        { label: 'Platform Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'User Vault', path: '/admin/users', icon: Users },
        { label: 'Content Forge', path: '/admin/questions', icon: BookOpen },
        { label: 'Audit Trail', path: '/admin/logs', icon: FileText },
      ]
    },
    TPO: {
      title: "Officer Station",
      badge: "Placement Officer",
      icon: Briefcase,
      nav: [
        { label: 'Analytics Engine', path: '/tpo-panel', icon: LineChart },
        { label: 'Company Clearances', path: '/tpo-panel/companies', icon: CheckCircle2 },
        { label: 'Dispatch Drives', path: '/tpo-panel/drives', icon: Briefcase },
        { label: 'Batch Radar', path: '/tpo-panel/students', icon: Users },
        { label: 'Mass Relay', path: '/tpo-panel/broadcast', icon: Megaphone },
      ]
    },
    Company: {
      title: "HR Workforce",
      badge: "Enterprise Rep",
      icon: Building2,
      nav: [
        { label: 'Profile Core', path: '/company-portal', icon: Building2 },
        { label: 'Active Directives', path: '/company-portal/drives', icon: Briefcase },
        { label: 'Applicant Pipeline', path: '/company-portal/ats', icon: Users },
      ]
    }
  };

  const config = roleConfigs[user?.role];
  if (!config) return <div className="p-10 font-black text-red-500">ERROR: Identity Spectrum unrecognized.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] flex">

      {/* Fixed Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#1f2028] border-r fixed h-full z-20 flex-col">
        {/* Role Badge Header */}
        <div className="p-6 flex items-center gap-3 border-b sticky top-0">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white">
            <config.icon size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black">{config.title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{config.badge}</p>
          </div>
        </div>

        {/* Dynamic Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2">
          {config.nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-blue-600' : 'opacity-60'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t">
          <button
            onClick={() => { dispatch(logout()); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area — renders child routes via Outlet */}
      <main className="flex-1 lg:ml-64 flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* Child route component is rendered here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RoleLayout;
```

### How Outlet Works with Nested Routes
```
URL: /admin/users
    │
    ├── App.jsx finds Route path="/admin" → renders ProtectedRoute → RoleLayout
    │       RoleLayout renders its sidebar + header
    │       <Outlet /> renders the matching child:
    └── Route path="users" → renders UserManagement inside <Outlet />
```
