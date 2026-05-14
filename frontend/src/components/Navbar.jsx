import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { fetchNotifications, markAllRead } from '../features/notifications/notificationSlice';
import { Bell, UserCircle, Menu, X, Settings, LogOut, User as UserIcon, ChevronDown, Globe, Compass, CheckCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExploreDropdownOpen, setIsExploreDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsProfileDropdownOpen(false);
    setIsExploreDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleMarkRead = () => {
    dispatch(markAllRead());
  };

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
        return [];
    }
  };

  const exploreLinks = user ? getExploreLinks(user.role) : [];

  const informationalLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 1. Left Section (Institutional Identity) */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-[#1e3a8a] rounded-full flex items-center justify-center shadow-md">
                <img src="/media/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                <Globe className="text-white w-6 h-6 absolute" style={{ zIndex: -1 }} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-md text-[#1e3a8a] leading-none tracking-tight">PLACEMENT</span>
                <span className="font-bold text-[10px] text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-wider mt-0.5">Preparation Portal</span>
              </div>
            </Link>
          </div>

          {/* 2. Center Section */}
          <div className="hidden md:flex items-center space-x-8">
            {informationalLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`text-sm font-semibold transition-all duration-200 relative py-2 ${isActive(link.path)
                    ? 'text-[#1e3a8a] font-bold'
                    : 'text-gray-600 hover:text-[#1e3a8a]'
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1e3a8a] rounded-full animate-fade-in"></span>
                )}
              </Link>
            ))}
          </div>

          {/* 3. Right Section */}
          <div className="flex items-center space-x-3">
            {user && exploreLinks.length > 0 && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => {
                    setIsExploreDropdownOpen(!isExploreDropdownOpen);
                    setIsProfileDropdownOpen(false);
                    setIsNotificationsOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isExploreDropdownOpen
                      ? 'bg-[#1e3a8a] text-white shadow-lg'
                      : 'bg-blue-50 text-[#1e3a8a] hover:bg-blue-100'
                    }`}
                >
                  <Compass size={18} className={isExploreDropdownOpen ? 'animate-spin-slow' : ''} />
                  Explore
                  <ChevronDown size={16} className={`transition-transform ${isExploreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExploreDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsExploreDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl py-3 border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 transform origin-top-right transition-all">
                      <div className="px-4 py-2 mb-2 border-b border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                      </div>
                      {exploreLinks.map((link, index) => (
                        <Link
                          key={index}
                          to={link.path}
                          className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1e3a8a] transition-colors"
                          onClick={() => setIsExploreDropdownOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 group-hover:bg-[#1e3a8a] mr-3 transition-all"></span>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="h-6 w-px bg-gray-200 hidden md:block mx-1"></div>

            <ThemeToggle />

            {user ? (
              <>
                {/* Notification Bell system */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileDropdownOpen(false);
                      setIsExploreDropdownOpen(false);
                    }}
                    className="p-2 text-gray-500 hover:text-[#1e3a8a] rounded-full hover:bg-gray-100 transition-colors relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Container */}
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-1 border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden transform origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                          <h3 className="font-bold text-sm text-gray-800">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              onClick={handleMarkRead}
                              className="text-xs text-[#1e3a8a] font-bold hover:underline flex items-center gap-1"
                            >
                              <CheckCircle size={12} /> Mark read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No notifications found</div>
                          ) : (
                            notifications.map((note) => (
                              <div key={note.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors relative ${!note.is_read ? 'bg-blue-50/40' : ''}`}>
                                {!note.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1e3a8a]" />}
                                <p className={`text-sm ${!note.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{note.message}</p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setIsExploreDropdownOpen(false);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 rounded-full border-2 border-transparent hover:border-blue-100 transition-colors focus:outline-none"
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 rounded-full shadow-sm">
                      <div className="bg-white rounded-full p-0.5">
                        <UserCircle size={28} className="text-gray-600" />
                      </div>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                          <p className="text-sm text-gray-900 font-bold truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-[#1e3a8a] text-[10px] font-bold rounded uppercase tracking-wide">
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1e3a8a] transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <UserIcon size={16} className="mr-3 text-gray-400" /> View Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1e3a8a] transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings size={16} className="mr-3 text-gray-400" /> Account Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={onLogout}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                          >
                            <LogOut size={16} className="mr-3" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="text-sm font-bold text-[#1e3a8a] hover:text-blue-800 px-3 py-2 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#1e3a8a] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-800 shadow-sm hover:shadow-md transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg focus:outline-none transition-colors ${isMobileMenuOpen ? 'bg-gray-100 text-[#1e3a8a]' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-2xl absolute top-16 left-0 w-full z-50 overflow-y-auto max-h-[calc(100vh-4rem)] animate-slide-down">
          <div className="px-4 pt-4 pb-6 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Navigation</p>
              <div className="space-y-1">
                {informationalLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isActive(link.path)
                        ? 'bg-blue-50 text-[#1e3a8a]'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {user && exploreLinks.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Authorized Menu</p>
                <div className="bg-gray-50 rounded-2xl p-2 space-y-1 border border-gray-100">
                  {exploreLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={link.path}
                      className="block px-4 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm bg-white border border-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {!user && (
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                <Link to="/login" className="block w-full text-center py-3 rounded-xl text-base font-bold text-[#1e3a8a] bg-blue-50" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block w-full text-center py-3 rounded-xl text-base font-bold text-white bg-[#1e3a8a]" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
