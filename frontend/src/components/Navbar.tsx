import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Bell, Menu, X, Check, AlertCircle, Sparkles, 
  LayoutDashboard, Receipt, Wallet, Target, 
  FileSpreadsheet, ShieldAlert, LogOut 
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen = false, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: Wallet },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <header className={`fixed top-0 right-0 left-0 ${user ? 'lg:left-64' : 'left-0'} z-30 flex flex-col font-sans`}>
      
      {/* Onboarding Setup Warning Alert */}
      {user && user.monthly_salary <= 0 && (
        <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/25 text-amber-900 px-6 py-3 text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-700 animate-pulse" />
            <span>Complete your initial onboarding financials configuration to initialize AI intelligence models.</span>
          </div>
          <Link 
            to="/setup" 
            className="bg-amber-600 hover:bg-amber-550 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            Configure Onboarding
          </Link>
        </div>
      )}
      
      {/* Main Navbar Bar */}
      <div className="flex items-center justify-between h-20 px-6 bg-white/80 backdrop-blur-xl border-b border-pink-100/85 shadow-sm">
        
        {/* Left Side: Brand Logo (Logged out) or Toggle/Welcome (Logged in) */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Toggle Sidebar mobile drawer button */}
              {setSidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-500 hover:text-pink-500 focus:outline-none lg:hidden p-2 rounded-xl bg-white border border-pink-100 transition-all shadow-sm"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}

              {/* Mobile Branding */}
              <div className="flex items-center gap-2 lg:hidden">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-md text-white font-bold">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-black text-gradient tracking-tight">SmartFinance AI</span>
              </div>

              {/* Desktop Welcome */}
              <div className="hidden lg:flex flex-col text-left">
                <h1 className="text-sm font-black text-slate-800 flex items-center gap-1.5 tracking-wide">
                  Welcome, {user?.full_name.split(' ')[0]}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-pink-600 font-bold">Active</span>
                </h1>
              </div>
            </>
          ) : (
            /* Logged out Logo Branding */
            <Link to="/login" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-pink-500/20 text-white font-bold animate-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-black text-gradient tracking-tight">SmartFinance AI</span>
            </Link>
          )}
        </div>

        {/* Center Section: Desktop Horizontal Navigation Menu (Only when logged in) */}
        {user && (
          <nav className="hidden lg:flex items-center space-x-1 mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-pink-50 border border-pink-100 text-pink-700 shadow-sm' 
                      : 'text-slate-500 hover:bg-pink-50/30 hover:text-pink-600 border border-transparent'
                  }`
                }
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => 
                  `flex items-center px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-rose-50 border border-rose-100 text-rose-700 shadow-sm' 
                      : 'text-rose-600 hover:bg-rose-50/30 hover:text-rose-700 border border-transparent'
                  }`
                }
              >
                <ShieldAlert className="mr-2 h-4 w-4 flex-shrink-0" />
                Admin
              </NavLink>
            )}
          </nav>
        )}

        {/* Right Section: Action Widgets (Auth buttons or Notifications/Profile/Logout) */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative p-2.5 text-slate-500 hover:text-pink-600 bg-white border border-pink-100 rounded-xl transition-all shadow-sm hover:scale-102 active:scale-98"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500 shadow-sm"></span>
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 border border-pink-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 bg-pink-50/50 border-b border-pink-100/50 flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">Alerts & System Logs</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllRead} 
                            className="text-xs text-pink-650 hover:text-pink-700 font-bold flex items-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center text-xs text-slate-400 font-bold">
                            No notifications or logs recorded.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`px-4 py-3.5 border-b border-slate-100 flex flex-col transition-all hover:bg-pink-50/10 ${!n.is_read ? 'bg-pink-500/5 border-l-2 border-l-pink-500' : 'opacity-65'}`}
                            >
                              <p className="text-xs text-slate-750 leading-relaxed font-semibold">{n.message}</p>
                              <div className="flex justify-between items-center mt-2.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  {new Date(n.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                </span>
                                {!n.is_read && (
                                  <button 
                                    onClick={() => markSingleRead(n.id)}
                                    className="text-xs text-pink-600 hover:text-pink-700 font-bold uppercase tracking-wider"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Vertical divider */}
              <div className="h-6 w-px bg-pink-100"></div>

              {/* Profile Badge (Clickable or hoverable) */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-700 select-none leading-none">{user?.full_name}</span>
                  <span className="text-[10px] font-semibold text-slate-400 select-none mt-1">{user?.email}</span>
                </div>
                <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center font-bold text-white text-sm shadow-md border border-pink-400/20 cursor-default select-none animate-glow">
                  {user?.full_name[0].toUpperCase()}
                </div>
              </div>

              {/* Vertical divider */}
              <div className="h-6 w-px bg-pink-100"></div>

              {/* Top main navbar Logout button */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-pink-50 hover:bg-pink-100/80 border border-pink-100 text-pink-750 font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs active:scale-95"
                title="Sign Out of session"
              >
                <LogOut className="h-4 w-4 text-pink-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            /* Logged out: Sign In and Sign Up buttons */
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white rounded-xl shadow-md transition-all active:scale-95 animate-glow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
