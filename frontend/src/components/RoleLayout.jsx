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

  // 1. Define Config Objects per Role
  const roleConfigs = {
    Admin: {
      title: "Admin Matrix",
      badge: "Root User",
      icon: ShieldAlert,
      basePath: "/admin",
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
      basePath: "/tpo-panel",
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
      basePath: "/company-portal",
      nav: [
        { label: 'Profile Core', path: '/company-portal', icon: Building2 },
        { label: 'Active Directives', path: '/company-portal/drives', icon: Briefcase },
        { label: 'Applicant Pipeline', path: '/company-portal/ats', icon: Users },
      ]
    }
  };

  const config = roleConfigs[user?.role];
  
  // Safeguard against role leak
  if (!config) return <div className="p-10 font-black text-red-500">ERROR: Identity Spectrum unrecognized.</div>;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-[#2e303a] bg-white dark:bg-[#1f2028] sticky top-0 z-10">
        <div className="bg-inst-blue w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <config.icon size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">{config.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest">{config.badge}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2 bg-white dark:bg-[#1f2028]">
        {config.nav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-inst-blue dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/50' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-[#16171d]/50 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-inst-blue dark:text-blue-400' : 'opacity-60'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-[#2e303a] bg-slate-50/50 dark:bg-[#16171d]/30">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-inst-blue dark:hover:text-blue-400 transition-colors rounded-lg">
          <Home size={18} /> System Root
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-lg mt-1">
          <LogOut size={18} /> Terminate
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] flex font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* Desktop Rail */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#1f2028] border-r border-slate-200 dark:border-[#2e303a] flex-col fixed h-full z-20 shadow-[1px_0_15px_rgba(0,0,0,0.01)]">
        <SidebarContent />
      </aside>

      {/* Mobile Slide-out Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="w-64 bg-white dark:bg-[#1f2028] h-full flex flex-col z-10 relative shadow-2xl animate-in slide-in-from-left">
            <button onClick={() => setIsMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-gray-800 p-1 rounded-md">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Containment Block */}
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Unified Top Header */}
        <header className="h-16 bg-white/90 dark:bg-[#1f2028]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#2e303a] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg text-slate-600 dark:text-slate-300">
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> 
              Secure Feed Sync
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-inst-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-[#1f2028] rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-[#2e303a] mx-1 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#16171d] pl-3 pr-1 py-1 rounded-full border border-slate-100 dark:border-[#2e303a]">
              <div className="text-right hidden xs:block">
                <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-white dark:bg-[#2e303a] border border-slate-200 dark:border-[#2e303a] rounded-full flex items-center justify-center text-slate-700 dark:text-gray-200 font-black shadow-sm">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Unified Content Surface */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden bg-gray-50 dark:bg-[#16171d]">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleLayout;
