# College Placement Preparation Portal
## Full Source Code Documentation — Volume 6
### Complete Source Code: All Frontend Pages (Every Component)

---

## 6.1 Complete Application File Inventory

Below is the exhaustive inventory of every source code file in the project, with its role and what volume documents it:

### Backend Files

| File | Volume | Category |
|------|--------|----------|
| `backend/server.js` | Phase 1 Docs | Server entry point |
| `backend/config/db.js` | Phase 1 Docs | Database connection |
| `backend/models/User.js` | Vol 1 | Database model |
| `backend/models/StudentProfile.js` | Vol 1 | Database model |
| `backend/models/PlacementDrive.js` | Vol 1 | Database model |
| `backend/models/DriveApplication.js` | Vol 1 | Database model |
| `backend/models/MockSession.js` | Vol 1 | Database model |
| `backend/models/MockResponse.js` | Vol 1 | Database model |
| `backend/models/QuestionBank.js` | Vol 1 | Database model |
| `backend/models/TestResult.js` | Vol 1 | Database model |
| `backend/models/Notification.js` | Vol 1 | Database model |
| `backend/models/AuditLog.js` | Vol 1 | Database model |
| `backend/models/AptitudeTest.js` | Vol 1 | Database model |
| `backend/models/CompanyProfile.js` | Vol 1 | Database model |
| `backend/models/TPOProfile.js` | Vol 1 | Database model |
| `backend/models/index.js` | Phase 1 Docs | Model associations |
| `backend/middleware/authMiddleware.js` | Vol 2 | JWT + RBAC security |
| `backend/routes/authRoutes.js` | Vol 2 | Auth API endpoints |
| `backend/routes/profileRoutes.js` | Vol 2 | Profile API endpoints |
| `backend/routes/driveRoutes.js` | Vol 2 | Drive API endpoints |
| `backend/routes/mockRoutes.js` | Vol 2 | Mock interview endpoints |
| `backend/routes/testRoutes.js` | Vol 2 | Test generation endpoints |
| `backend/routes/adminRoutes.js` | Vol 2 | Admin control endpoints |
| `backend/routes/tpoRoutes.js` | Vol 2 | TPO command endpoints |
| `backend/routes/companyRoutes.js` | Vol 2 | Company HR endpoints |
| `backend/routes/userRoutes.js` | Vol 2 | User management endpoints |
| `backend/controllers/authController.js` | Phase 1 Docs | Auth logic |
| `backend/controllers/profileController.js` | Vol 2 | Profile + ATS + PDF |
| `backend/controllers/adminController.js` | Vol 3 | Admin system control |
| `backend/controllers/tpoController.js` | Vol 3 | TPO analytics + broadcast |
| `backend/controllers/testController.js` | Vol 3 | AI test generation |
| `backend/controllers/companyController.js` | Vol 5 | Company HR + Offer Letters |
| `backend/controllers/mockController.js` | Vol 5 | Mock interview AI pipeline |
| `backend/controllers/driveController.js` | Vol 7 | Drive listings + applications |
| `backend/utils/aiService.js` | Phase 3 Docs | Gemini AI integration |
| `backend/utils/resumeGenerator.js` | Vol 2 | PDFKit resume builder |
| `backend/utils/emailService.js` | Vol 5 | Nodemailer SMTP |
| `backend/utils/cloudinaryService.js` | Vol 5 | Media CDN uploads |

### Frontend Files

| File | Volume | Category |
|------|--------|----------|
| `frontend/src/main.jsx` | Phase 1 Docs | React entry + Axios interceptor |
| `frontend/src/App.jsx` | Vol 4 | Complete routing manifest |
| `frontend/src/index.css` | Vol 6 (this) | Global CSS tokens |
| `frontend/src/app/store.js` | Vol 6 (this) | Redux store configuration |
| `frontend/src/features/auth/authSlice.js` | Vol 2 | Auth Redux slice |
| `frontend/src/features/notifications/notificationSlice.js` | Vol 6 (this) | Notification Redux slice |
| `frontend/src/components/Navbar.jsx` | Vol 6 (this) | Global navigation |
| `frontend/src/components/ProtectedRoute.jsx` | Vol 4 | Route security HOC |
| `frontend/src/components/RoleLayout.jsx` | Vol 4 | Sidebar layout |
| `frontend/src/components/Layout.jsx` | Vol 6 (this) | Global page layout |
| `frontend/src/components/Footer.jsx` | Vol 6 (this) | Global footer |
| `frontend/src/components/ThemeToggle.jsx` | Vol 6 (this) | Dark mode toggle |
| `frontend/src/pages/Home.jsx` | Phase 6 Docs | Landing page |
| `frontend/src/pages/Login.jsx` | Phase 1 Docs | Authentication |
| `frontend/src/pages/Register.jsx` | Phase 1 Docs | Registration |
| `frontend/src/pages/ForgotPassword.jsx` | Phase 6 Docs | Password recovery |
| `frontend/src/pages/Dashboard.jsx` | Phase 6 Docs | Role routing wrapper |
| `frontend/src/pages/Profile.jsx` | Phase 5 Docs | Student profile viewer |
| `frontend/src/pages/Settings.jsx` | Phase 6 Docs | Account settings |
| `frontend/src/pages/About.jsx` | Phase 6 Docs | Static about page |
| `frontend/src/pages/Contact.jsx` | Phase 6 Docs | Contact form |
| `frontend/src/pages/AptitudeTest.jsx` | Phase 4 Docs | AI MCQ test |
| `frontend/src/pages/MockInterview.jsx` | Phase 3 Docs | AI chat interview |
| `frontend/src/pages/PlacementDrives.jsx` | Phase 4 Docs | Job drives listing |
| `frontend/src/pages/ResumeBuilder.jsx` | Phase 5 Docs | ATS resume builder |
| `frontend/src/pages/ResumeAnalyzer.jsx` | Phase 3 Docs | AI resume analyzer |
| `frontend/src/pages/admin/AdminDashboard.jsx` | Phase 2 Docs | Admin stats |
| `frontend/src/pages/admin/UserManagement.jsx` | Vol 6 (this) | User control |
| `frontend/src/pages/admin/QuestionManager.jsx` | Vol 6 (this) | Question bank |
| `frontend/src/pages/admin/SystemLogs.jsx` | Vol 6 (this) | Audit logs viewer |
| `frontend/src/pages/tpo/TPOAnalytics.jsx` | Phase 2 Docs | TPO charts |
| `frontend/src/pages/tpo/CompanyApproval.jsx` | Vol 6 (this) | Company verify |
| `frontend/src/pages/tpo/DriveLifecycle.jsx` | Vol 6 (this) | Drive launch |
| `frontend/src/pages/tpo/StudentTracker.jsx` | Vol 6 (this) | Readiness radar |
| `frontend/src/pages/tpo/BroadcastCenter.jsx` | Vol 6 (this) | Mass email |
| `frontend/src/pages/company/CompanyProfile.jsx` | Phase 2 Docs | Company profile |
| `frontend/src/pages/company/DriveManager.jsx` | Vol 6 (this) | Company drive CRUD |
| `frontend/src/pages/company/RecruitmentATS.jsx` | Vol 6 (this) | Applicant pipeline |

---

## 6.2 Redux Store (`frontend/src/app/store.js`)

**Purpose:** Configures the global Redux Store with all feature reducers combined. All React components access state via `useSelector(state => state.*)`.

### Full Source Code
```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,               // state.auth → { user, isLoading, isError, isSuccess, message }
    notifications: notificationReducer, // state.notifications → { notifications, unreadCount }
  },
});
```

---

## 6.3 Notification Redux Slice (`frontend/src/features/notifications/notificationSlice.js`)

**Purpose:** Manages the global in-app notification system. The `unreadCount` drives the red badge number on the Navbar bell icon.

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all unread notifications for the logged-in user
export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await axios.get('http://localhost:5000/api/notifications', { withCredentials: true });
    return res.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

// Mark all as read in the database
export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, thunkAPI) => {
  try {
    await axios.put('http://localhost:5000/api/notifications/read-all', {}, { withCredentials: true });
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to mark notifications as read');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        // Count only unread notifications for badge display
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
        state.isLoading = false;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      // After marking read, reset the unread counter locally
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
      });
  },
});

export default notificationSlice.reducer;
```

---

## 6.4 Layout Component (`frontend/src/components/Layout.jsx`)

**Purpose:** Wraps all public-facing and student pages with the Navbar + Footer. Uses React Router's `<Outlet />` to render the matched child route component.

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />  {/* Child route component renders here */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
```

---

## 6.5 ThemeToggle Component (`frontend/src/components/ThemeToggle.jsx`)

**Purpose:** Toggles the `dark` class on the HTML `<html>` element to activate Tailwind's dark mode. Persists the user's preference to `localStorage`.

```jsx
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
```

---

## 6.6 Navbar Navigation Architecture

The `Navbar.jsx` component is a 379-line state-driven component. Its most important feature is the **role-aware dynamic navigation menu** — a function that returns different navigation links based on who is logged in:

```javascript
// Inside Navbar.jsx — getExploreLinks function
const getExploreLinks = (role) => {
  switch (role) {
    case 'Student':
      return [
        { name: 'Performance Dashboard', path: '/dashboard' },
        { name: 'Aptitude Tests', path: '/aptitude-test' },
        { name: 'AI Mock Interview', path: '/mock-interview' },
        { name: 'Resume Builder', path: '/resume-builder' },
        { name: 'AI Resume Analyzer', path: '/resume-analyzer' },
        { name: 'Job Drives', path: '/drives' },
      ];
    case 'TPO':
      return [
        { name: 'TPO Master Control', path: '/tpo-panel' },
        { name: 'Launch Drive', path: '/tpo-panel/drives' },
        { name: 'Company Approvals', path: '/tpo-panel/companies' },
        { name: 'Readiness Tracker', path: '/tpo-panel/students' },
        { name: 'Mass Dispatch', path: '/tpo-panel/broadcast' },
      ];
    case 'Company':
      return [
        { name: 'Company Profile', path: '/company-portal' },
        { name: 'Drive Management', path: '/company-portal/drives' },
        { name: 'Applicant Tracking', path: '/company-portal/ats' },
      ];
    case 'Admin':
      return [
        { name: 'Admin Dashboard', path: '/admin' },
        { name: 'User Management', path: '/admin/users' },
        { name: 'Question Bank', path: '/admin/questions' },
        { name: 'System Audits', path: '/admin/logs' },
      ];
    default:
      return []; // Public users get no Explore links
  }
};
```

**Behavior:** A student sees the Student menu. A TPO sees the TPO menu. The same Navbar component adapts entirely based on `user.role` from the Redux store.

---

## 6.7 Navbar Notification System

The Navbar auto-fetches notifications when a user logs in:
```javascript
useEffect(() => {
  if (user) {
    dispatch(fetchNotifications()); // Load from backend
  }
}, [dispatch, user]);
```

The unread count is displayed as a red badge:
```jsx
<button className="relative">
  <Bell size={20} />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
      {unreadCount}
    </span>
  )}
</button>
```
