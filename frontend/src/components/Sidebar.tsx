import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Target, 
  FileSpreadsheet, 
  ShieldAlert, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-card transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between border-r border-pink-100 bg-white/90 shadow-lg`}>
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        
        {/* Logo Brand Container */}
        <div className="flex items-center gap-3 px-6 mb-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-pink-500/20 text-white font-bold animate-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-black text-gradient tracking-tight">SmartFinance AI</span>
        </div>
        
        {/* Navigation Routes */}
        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md shadow-pink-500/10 border-l-4 border-pink-400' 
                    : 'text-slate-500 hover:bg-pink-50/50 hover:text-pink-600 border-l-4 border-transparent hover:translate-x-1'
                }`
              }
            >
              <item.icon className="mr-3 h-4.5 w-4.5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 mt-6 relative group overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/10 border-l-4 border-rose-400' 
                    : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-l-4 border-transparent hover:translate-x-1'
                }`
              }
            >
              <ShieldAlert className="mr-3 h-4.5 w-4.5 flex-shrink-0" />
              Admin Panel
            </NavLink>
          )}
        </nav>
      </div>

      {/* User Session profile panel */}
      <div className="flex-shrink-0 flex border-t border-pink-100 p-4 bg-pink-50/30">
        <div className="flex flex-col w-full">
          <div className="flex items-center mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center font-bold text-white shadow-md border border-pink-400/20">
              {user?.full_name[0].toUpperCase()}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
              <p className="text-xs text-pink-600 font-bold uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200 hover:shadow-sm"
          >
            <LogOut className="mr-2 h-4.5 w-4.5 text-slate-500" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
