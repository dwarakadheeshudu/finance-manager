import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';

import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

// Private Route Protector
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdfafb]">
        <div className="h-10 w-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main Layout Wrapper
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && user.monthly_salary <= 0) {
      navigate('/setup');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#fdfafb] bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.06),_transparent_45%)] transition-colors duration-500">
      
      {/* Mobile Sidebar backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/10 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Navigation Panels */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Drawer */}
      <main className="lg:pl-64 pt-24 pb-12 px-6 min-h-screen flex flex-col justify-between">
        <div className="max-w-7xl w-full mx-auto">
          {children}
        </div>
        
        {/* Floating Chat Assistant */}
        <AIChatbot />
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Financial Onboarding Wizard */}
      <Route 
        path="/setup" 
        element={
          <PrivateRoute>
            <Setup />
          </PrivateRoute>
        } 
      />

      {/* Core Dashboard Modules */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/budgets" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Budgets />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/expenses" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/goals" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Goals />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/reports" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AdminPanel />
            </DashboardLayout>
          </PrivateRoute>
        } 
      />

      {/* Wildcard Fallback redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
