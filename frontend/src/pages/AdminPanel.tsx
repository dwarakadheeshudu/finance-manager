import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Users, RefreshCw, Cpu, Activity, CpuIcon, Database, ArrowLeftRight } from 'lucide-react';

interface AdminAnalytics {
  total_users: number;
  active_users: number;
  total_transactions: number;
  ai_usage_analytics: {
    nlp_count: number;
    manual_count: number;
    average_confidence: number;
    ai_adoption_rate: number;
  };
  system_health: {
    status: string;
    database: string;
    cpu_usage_pct: number;
    memory_usage_pct: number;
    version: string;
  };
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Security Safeguard: Role routing protection
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const aiStats = stats?.ai_usage_analytics;
  const sysHealth = stats?.system_health;

  const chartData = [
    {
      name: 'Adoption',
      'AI NLP Input': aiStats?.nlp_count || 0,
      'Manual Input': aiStats?.manual_count || 0
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl bg-white/80 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-850 flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck className="h-5.5 w-5.5 text-pink-500" />
            System Control Panel
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Global administrative dashboard compiling usage telemetry and service health logs.</p>
        </div>
        <button
          onClick={fetchAdminStats}
          className="p-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 rounded-xl transition-all shadow-sm active:scale-95 animate-glow"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Analytics KPI widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <div className="flex justify-between items-start text-slate-550 font-bold">
            <span className="text-xs uppercase tracking-wider">Total Accounts</span>
            <Users className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-3">{stats?.total_users}</p>
          <span className="text-xs text-slate-400 mt-1 block font-bold">Registered in database</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <div className="flex justify-between items-start text-slate-550 font-bold">
            <span className="text-xs uppercase tracking-wider">Active Users (30d)</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-3">{stats?.active_users}</p>
          <span className="text-xs text-slate-400 mt-1 block font-bold">Users who logged expenses</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <div className="flex justify-between items-start text-slate-550 font-bold">
            <span className="text-xs uppercase tracking-wider">Transactions Logged</span>
            <ArrowLeftRight className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-3">{stats?.total_transactions}</p>
          <span className="text-xs text-slate-400 mt-1 block font-bold">Total Expense logs</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <div className="flex justify-between items-start text-slate-550 font-bold">
            <span className="text-xs uppercase tracking-wider">AI Adoption Rate</span>
            <ShieldCheck className="h-5 w-5 text-pink-550" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-3">{aiStats?.ai_adoption_rate}%</p>
          <span className="text-xs text-slate-400 mt-1 block font-bold">NLP vs Manual logging ratio</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md lg:col-span-2 bg-white/80">
          <h3 className="text-base font-bold text-slate-800 mb-6 uppercase tracking-wider">AI Parser Usage Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,182,193,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', color: '#1e293b', fontSize: 11, boxShadow: '0 10px 25px rgba(236,72,153,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 600 }} />
                <Bar dataKey="AI NLP Input" fill="#ff85a1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Manual Input" fill="#c084fc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-md flex flex-col justify-between bg-white/80">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">System Telemetry</h3>
          
          <div className="space-y-4 my-4">
            <div className="flex justify-between items-center text-sm border-b border-pink-50 pb-2.5">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Cpu className="h-4.5 w-4.5 text-pink-400" /> CPU Load</span>
              <span className="font-bold text-slate-800">{sysHealth?.cpu_usage_pct}%</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-pink-50 pb-2.5">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Database className="h-4.5 w-4.5 text-pink-400" /> Database Server</span>
              <span className="font-bold text-emerald-600">{sysHealth?.database}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-pink-50 pb-2.5">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-pink-400" /> System Health Status</span>
              <span className="font-bold text-emerald-600">{sysHealth?.status}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">Application Version</span>
              <span className="font-bold text-slate-500">v{sysHealth?.version}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-500/5 border border-pink-100 text-xs text-slate-500 font-semibold leading-relaxed shadow-inner">
            🛡️ Administrative actions are encrypted. Ensure system updates are scheduled during off-peak hours to minimize service locks.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
