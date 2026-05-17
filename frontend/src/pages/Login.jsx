import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin, reset } from '../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // Ideally use a toast notification
    }

    if (isSuccess || user) {
      const role = user?.role;
      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Student') {
        navigate('/student-dashboard');
      } else if (role === 'TPO') {
        navigate('/tpo-panel');
      } else if (role === 'Company') {
        navigate('/company-portal');
      } else {
        navigate('/');
      }
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  const onGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const onGoogleError = () => {
    alert('Google Sign-In Failed');
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 sm:px-0 py-8">
      <div className="bg-white dark:bg-[#1f2028] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-[#2e303a]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Please enter your details to sign in.</p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap
            shape="pill"
            width="300px"
          />
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300 dark:border-[#2e303a]"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm">or sign in with email</span>
          <div className="flex-grow border-t border-gray-300 dark:border-[#2e303a]"></div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all outline-none"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#aa3bff] focus:border-transparent transition-all outline-none"
              id="password"
              name="password"
              value={password}
              placeholder="Enter password"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="flex justify-end -mt-4 mb-2">
            <Link 
              to="/forgot-password" 
              className="text-sm font-semibold text-[#aa3bff] hover:text-[#902bd9] hover:underline transition-all duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#aa3bff] hover:bg-[#902bd9] text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#aa3bff] hover:text-[#902bd9]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
