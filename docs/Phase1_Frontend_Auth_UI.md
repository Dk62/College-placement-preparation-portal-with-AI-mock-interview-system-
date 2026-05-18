# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 1: Core System & Architecture
## Chapter 3: Frontend Authentication UIs (`Register.jsx` & `Login.jsx`)

### 3.1 Overview and Purpose
The Frontend Authentication module relies heavily on React Hooks (`useState`, `useEffect`), Redux State Management (`useSelector`, `useDispatch`), and the Google OAuth Library. 
These components are fully responsive and strictly enforce Dark/Light mode thematic designs using Tailwind CSS tokens. 

The `Login.jsx` and `Register.jsx` components operate as the gateway to the protected dashboard routes.

### 3.2 Registration UI (`Register.jsx`)
The Registration page allows a user to sign up via standard Email/Password or instantly via Google OAuth. The form state is locally managed and then dispatched to the Redux store upon submission.

#### 3.2.1 Source Code with Comments
```jsx
// =======================================================
// DEPENDENCIES & HOOKS
// =======================================================
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, reset } from '../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  // Local Form State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student', // Defaults to Student to prevent Null constraints
  });

  const { name, email, password, role } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Extract global authentication state from Redux
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // =======================================================
  // LIFECYCLE EVENT WATCHER
  // =======================================================
  useEffect(() => {
    // Alert the user if the backend returns an error (e.g., Email already exists)
    if (isError) {
      alert(message);
    }

    // Redirect to the homepage upon successful authentication
    if (isSuccess || user) {
      navigate('/');
    }

    // Reset the Redux state flags to prevent infinite redirect loops
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  // =======================================================
  // EVENT HANDLERS
  // =======================================================
  // Dynamically update form data based on the input 'name' attribute
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Dispatch manual registration action
  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password, role };
    dispatch(register(userData));
  };

  // Dispatch Google OAuth payload to Redux
  const onGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const onGoogleError = () => {
    alert('Google Sign-In Failed');
  };

  // =======================================================
  // RENDER (JSX)
  // =======================================================
  return (
    <div className="flex justify-center items-center py-10 px-4 sm:px-0">
      {/* Container with auto-switching Dark Mode backgrounds */}
      <div className="bg-white dark:bg-[#1f2028] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2e303a]">
        
        {/* ... Headers & Google Login Button ... */}
        
        {/* Registration Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Example Input Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name / Company Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all outline-none"
              id="name"
              name="name"
              value={name}
              placeholder="Enter your name"
              onChange={onChange}
              required
            />
          </div>

          {/* Role Selector (Critical for RBAC Matrix) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register As</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all outline-none"
            >
              <option value="Student">Student</option>
              <option value="TPO">TPO</option>
              <option value="Company">Company</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Dynamic Loading State on Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#aa3bff] hover:bg-[#902bd9] text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
```

---

### 3.3 Login UI (`Login.jsx`)
The Login page is architecturally similar to Registration, but it contains a highly complex **Role-Based Routing Algorithm** within its `useEffect` hook. Instead of just redirecting users to the homepage, it reads the User's assigned role from the Redux state and dynamically redirects them to their respective specialized dashboard.

#### 3.3.1 Role-Based Routing Logic
```javascript
  useEffect(() => {
    if (isError) {
      alert(message);
    }

    if (isSuccess || user) {
      const role = user?.role;
      // Multi-Tenant Redirection Matrix
      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Student') {
        navigate('/student-dashboard');
      } else if (role === 'TPO') {
        navigate('/tpo-panel');
      } else if (role === 'Company') {
        navigate('/company-portal');
      } else {
        navigate('/'); // Fallback
      }
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);
```

### 3.4 Detailed Technical Breakdown

#### 3.4.1 Redux Store Integration (`authSlice`)
Both pages do not interact with `axios` directly. Instead, they rely strictly on `react-redux`. When the user clicks submit, the `dispatch(register(userData))` command is fired. This triggers an asynchronous Thunk inside the `authSlice.js` file, which makes the actual HTTP POST request to the backend. 
Because of this separation of concerns, the UI components remain clean, focusing purely on Rendering and State representation.

#### 3.4.2 React `useEffect` Infinite Loop Prevention
Notice the `dispatch(reset());` command at the end of the `useEffect` blocks. 
When an action succeeds (e.g., `isSuccess` turns true), Redux updates its global state, which triggers a re-render. If `isSuccess` remained true indefinitely, the user could never access the login page again (it would instantly redirect them). The `reset()` action safely clears the temporal state flags (`isSuccess`, `isError`, `message`) while preserving the persisted `user` token.

#### 3.4.3 Fluid UI & Thematic Styling
The inputs and containers utilize Tailwind's pseudo-selectors (`dark:`, `focus:`, `hover:`) to create a fluid, premium aesthetic without writing custom CSS media queries.
- **Glassmorphic inputs**: `bg-gray-50 dark:bg-[#16171d]`
- **Interactive focus rings**: `focus:ring-2 focus:ring-[#aa3bff]`
This guarantees the Registration and Login portals feel responsive and natively adapt to the user's OS preference (Dark/Light Mode).
