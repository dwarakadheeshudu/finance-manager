import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, IndianRupee, Sparkles, TrendingUp, AlertTriangle, AlertCircle,
  HelpCircle, CheckCircle2, ShieldCheck, Play, Edit3, Settings2, X, Landmark, Save, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    monthly_salary: number;
    total_expenses: number;
    savings_goal: number;
    actual_savings: number;
    remaining_balance: number;
    health_score: number;
    health_grade: string;
    health_feedback: string;
  };
  pie_chart: Array<{ name: string; value: number }>;
  bar_chart: Array<{ month: string; income: number; expenses: number; savings: number }>;
  savings_progress: {
    goal_amount: number;
    actual_amount: number;
    percentage: number;
  };
  predicted_chart: Array<{ category: string; predicted: number }>;
}

// Gorgeous palette matching the White & Pink theme (Baby Pink, Fuchsia, Rose, Violet)
const COLORS = ['#ff85a1', '#ffccd5', '#ec4899', '#f43f5e', '#d946ef', '#a855f7', '#fb7185', '#fda4af', '#c084fc'];

const Dashboard: React.FC = () => {
  const { user, setupFinancials } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nlpText, setNlpText] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpSuccess, setNlpSuccess] = useState(false);
  const [nlpError, setNlpError] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Financial profile editing modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSalary, setEditSalary] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/analytics');
      setData(res.data);
      
      // Fetch fresh AI recommendations
      const recRes = await api.post('/ai/savings-recommendation');
      setRecommendations(recRes.data.recommendations);
      
      // Trigger score recalculation on load
      await api.post('/ai/financial-health-score');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleNlpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpText.trim()) return;
    
    setNlpLoading(true);
    setNlpError('');
    setNlpSuccess(false);
    
    try {
      await api.post('/expenses/nlp', { expense_text: nlpText });
      setNlpSuccess(true);
      setNlpText('');
      // Refetch analytics data to update charts
      await fetchDashboardData();
      
      // Auto-hide success message
      setTimeout(() => setNlpSuccess(false), 3000);
    } catch (err: any) {
      setNlpError(err.response?.data?.detail || 'Could not parse transaction details.');
    } finally {
      setNlpLoading(false);
    }
  };

  // Open modal and prepopulate values
  const openEditModal = () => {
    if (user) {
      setEditSalary(user.monthly_salary > 0 ? user.monthly_salary.toString() : '');
      setEditGoal(user.savings_goal > 0 ? user.savings_goal.toString() : '');
    }
    setModalError('');
    setModalSuccess(false);
    setIsModalOpen(true);
  };

  // Handle saving the edited financial settings
  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalSuccess(false);

    const salNum = Number(editSalary) || 0;
    const goalNum = Number(editGoal) || 0;

    if (salNum <= 0) {
      setModalError('Monthly salary must be greater than zero.');
      setModalLoading(false);
      return;
    }
    if (goalNum < 0) {
      setModalError('Savings goal cannot be negative.');
      setModalLoading(false);
      return;
    }
    if (goalNum > salNum) {
      setModalError('Savings goal cannot exceed monthly salary.');
      setModalLoading(false);
      return;
    }

    try {
      await setupFinancials(salNum, goalNum);
      setModalSuccess(true);
      
      // Refresh dashboard info
      await fetchDashboardData();
      
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1550);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update financial settings.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-10 w-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary;
  const pieData = data?.pie_chart.filter(item => item.value > 0) || [];
  const barData = data?.bar_chart || [];
  const predictedData = data?.predicted_chart || [];
  const progress = data?.savings_progress;

  const healthColor = 
    summary?.health_grade === 'Excellent' ? 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5' :
    summary?.health_grade === 'Good' ? 'text-teal-600 border-teal-500/20 bg-teal-500/5' :
    summary?.health_grade === 'Average' ? 'text-amber-600 border-amber-500/20 bg-amber-500/5' :
    'text-rose-600 border-rose-500/20 bg-rose-500/5';

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header and Quick Adjust button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-pink-500 animate-glow rounded-lg" />
            Financial Intelligence Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Real-time analysis, future expense forecasting, and automated budget advice.</p>
        </div>
        <button
          onClick={openEditModal}
          className="px-5 py-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-200 text-pink-600 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm hover:scale-102 active:scale-98 animate-glow"
        >
          <Settings2 className="h-4.5 w-4.5 text-pink-500" />
          Adjust Core Financials
        </button>
      </div>

      {/* NLP Instant Logging Bar */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100/80 shadow-lg bg-gradient-premium relative overflow-hidden group bg-white/80">
        <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
          <Sparkles className="h-44 w-44 text-pink-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500 animate-glow rounded-md" />
            Quick AI Transaction Logger
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-semibold">Say goodbye to forms. Enter your expense details in natural text to let the AI process it.</p>
          
          <form onSubmit={handleNlpSubmit} className="mt-4 flex flex-col md:flex-row gap-3">
            <input
              type="text"
              required
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              placeholder="e.g. Spent ₹340 on dinner, Auto ride for ₹120, Paid electricity bill of ₹2100"
              className="flex-1 px-4 py-3.5 text-sm glass-input rounded-xl focus:outline-none placeholder-slate-400 font-semibold shadow-inner"
            />
            <button
              type="submit"
              disabled={nlpLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-98"
            >
              {nlpLoading ? (
                <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : <Play className="h-4.5 w-4.5 fill-white" />}
              Log Expense
            </button>
          </form>

          {nlpSuccess && (
            <div className="mt-3 text-sm text-emerald-600 flex items-center gap-1.5 animate-pulse font-semibold">
              <CheckCircle2 className="h-4.5 w-4.5" /> Transaction logged and categorized successfully!
            </div>
          )}
          {nlpError && (
            <div className="mt-3 text-sm text-rose-600 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4.5 w-4.5" /> {nlpError}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Salary Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-pink-100 shadow-sm relative overflow-hidden group bg-white/80">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Monthly Salary</span>
            <button 
              onClick={openEditModal}
              className="h-7 w-7 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all shadow-inner"
              title="Edit Salary"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
            ₹{summary?.monthly_salary.toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
          <div className="text-xs text-slate-400 mt-2 flex items-center font-bold">
            <span>Primary active budget cap</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-pink-100 shadow-sm relative overflow-hidden group bg-white/80">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Total Expenses</span>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-inner">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
            ₹{summary?.total_expenses.toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
          <div className="text-xs text-slate-500 mt-2 flex items-center font-bold">
            <span className="text-rose-500 font-extrabold mr-1">
              {summary && summary.monthly_salary > 0 
                ? ((summary.total_expenses / summary.monthly_salary) * 100).toFixed(0) 
                : 0}%
            </span>
            <span>of income consumed</span>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-pink-100 shadow-sm relative overflow-hidden group bg-white/80">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Savings Goal</span>
            <button 
              onClick={openEditModal}
              className="h-7 w-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-600 hover:bg-fuchsia-600 hover:text-white flex items-center justify-center transition-all shadow-inner"
              title="Edit Goal"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
            ₹{summary?.savings_goal.toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
          <div className="text-xs text-slate-400 mt-2 flex items-center font-bold">
            <span>Configured monthly target</span>
          </div>
        </div>

        {/* Actual Savings Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-pink-100 shadow-sm relative overflow-hidden group bg-white/80">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Actual Savings</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
            ₹{summary?.actual_savings.toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
          <div className="text-xs text-slate-500 mt-2 flex items-center font-bold">
            <span className={`font-extrabold mr-1 ${progress && progress.percentage >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {progress?.percentage.toFixed(0)}%
            </span>
            <span>of savings target met</span>
          </div>
        </div>

        {/* Remaining Surplus Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-pink-100 shadow-sm relative overflow-hidden group bg-white/80">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-wider">Remaining Surplus</span>
            <div className="h-7 w-7 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-500 flex items-center justify-center shadow-inner">
              <Landmark className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-4 tracking-tight">
            ₹{summary?.remaining_balance.toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
          <div className="text-xs text-slate-400 mt-2 flex items-center font-bold">
            <span>Cash pool after expenses</span>
          </div>
        </div>
      </div>

      {/* Diagnostics and Health score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score Gauge */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg flex flex-col justify-between relative overflow-hidden bg-white/70">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Health Diagnostics</h3>
          
          <div className="flex flex-col items-center justify-center my-6 relative z-10">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute w-28 h-28 border border-pink-500/10 rounded-full animate-pulse-slow"></div>
              
              <div className="text-5xl font-black text-slate-800 tracking-tighter flex items-baseline justify-center">
                {summary?.health_score}
                <span className="text-xs text-slate-400 font-bold ml-0.5">/100</span>
              </div>
            </div>
            
            <div className={`mt-5 px-4 py-1.5 rounded-full text-xs font-bold border shadow-inner ${healthColor}`}>
              {summary?.health_grade} Grade
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-100 flex items-start shadow-inner">
            <ShieldCheck className="h-5 w-5 text-pink-500 mr-2.5 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              {summary?.health_feedback ? summary.health_feedback.replace(/ \| /g, '. ') : 'No diagnostics recorded yet.'}
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg lg:col-span-2 flex flex-col justify-between relative overflow-hidden bg-white/70">
          <div className="absolute top-0 left-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="h-4.5 w-4.5 text-pink-500 animate-glow rounded-md" />
              Smart Saving Recommendations
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Actionable updates automatically formulated based on categorizations.</p>
          </div>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto max-h-56 pr-2 custom-scrollbar">
            {recommendations.length === 0 ? (
              <div className="text-xs text-slate-400 py-12 text-center font-bold">No alerts generated. Add more transactions to feed optimization models.</div>
            ) : (
              recommendations.map((rec, index) => {
                const isWarning = rec.includes('⚠️') || rec.includes('🔴') || rec.includes('🟡');
                const isSuccess = rec.includes('✅') || rec.includes('🎉') || rec.includes('🌟');
                const cardBorder = isWarning ? 'border-amber-500/10 bg-amber-500/5 text-amber-700' : isSuccess ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-700' : 'border-pink-100 bg-white/50 text-slate-700';
                
                return (
                  <div key={index} className={`p-3.5 rounded-2xl border text-xs leading-relaxed transition-all shadow-sm ${cardBorder} font-semibold`}>
                    {rec}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expenses Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg relative overflow-hidden bg-white/70">
          <h3 className="text-xs font-bold text-slate-700 mb-6 uppercase tracking-wider">Income vs Expenses (Past 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', color: '#1e293b', fontSize: 11, boxShadow: '0 10px 25px rgba(236,72,153,0.06)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 15, fontWeight: 600 }} />
                <Bar dataKey="income" name="Income Cap" fill="url(#incomeGrad)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Spent" fill="url(#spentGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution Pie Chart */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg relative overflow-hidden bg-white/70">
          <h3 className="text-xs font-bold text-slate-700 mb-6 uppercase tracking-wider">Category Spending Distribution</h3>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400 my-auto font-bold">No expenses logged for this cycle. Try creating one!</div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', color: '#1e293b', fontSize: 11, boxShadow: '0 10px 25px rgba(236,72,153,0.06)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col space-y-1.5 max-h-60 overflow-y-auto px-4 mt-4 sm:mt-0 custom-scrollbar">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center text-xs p-1.5 rounded-xl hover:bg-pink-50/30 transition-colors">
                      <div className="flex items-center">
                        <span className="h-2.5 w-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-slate-600 font-bold">{item.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-800">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI Forecast / Predictions Chart */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg relative overflow-hidden bg-white/70">
          <h3 className="text-xs font-bold text-slate-700 mb-6 uppercase tracking-wider">AI Forecast Next Month Expenses</h3>
          <div className="h-72">
            {predictedData.length === 0 ? (
              <div className="text-xs text-slate-400 py-28 text-center font-bold">Awaiting additional expense updates to compile predictions.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.05)" />
                  <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fbcfe8', borderRadius: '16px', color: '#1e293b', fontSize: 11, boxShadow: '0 10px 25px rgba(236,72,153,0.06)' }}
                  />
                  <Area type="monotone" dataKey="predicted" name="AI Predicted (₹)" stroke="#ec4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredicted)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Savings Goal Progress */}
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-lg flex flex-col justify-between relative overflow-hidden bg-white/70">
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Savings Milestone</h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Measuring real-time savings surpluses against primary goals.</p>
          </div>

          <div className="my-auto space-y-6 py-6 relative z-10">
            <div className="flex justify-between items-end text-xs font-bold">
              <span className="text-slate-500">Monthly goal: ₹{progress?.goal_amount.toLocaleString()}</span>
              <span className="text-sm font-extrabold text-gradient">₹{progress?.actual_amount.toLocaleString()} ({progress?.percentage.toFixed(0)}%)</span>
            </div>
            
            <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 h-full rounded-full transition-all duration-700 ease-out shadow-inner" 
                style={{ width: `${Math.min(100, progress?.percentage || 0)}%` }}
              ></div>
            </div>

            <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-100 flex items-start text-xs text-slate-650 leading-relaxed shadow-sm font-semibold">
              {progress && progress.percentage >= 100 ? (
                <span>🎉 Excellent job! You have fully hit your monthly savings benchmark. Consider raising your goal for the next cycle.</span>
              ) : (
                <span>💡 You are currently short of your monthly target by <strong className="text-pink-600">₹{Math.max(0, (progress?.goal_amount || 0) - (progress?.actual_amount || 0)).toLocaleString()}</strong>. Check the recommendations panel above for suggestions on where to save.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE FINANCIAL ADJUSTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md transition-opacity duration-300">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-pink-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 bg-white">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-extrabold text-slate-800">Adjust Core Financials</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-xs font-semibold flex items-center shadow-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-xs font-semibold flex items-center animate-pulse shadow-sm">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Financial targets adjusted and budget rules reallocated!</span>
              </div>
            )}

            <form onSubmit={handleSaveFinancials} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monthly Salary (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editSalary}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setEditSalary(val);
                      }
                    }}
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-pink-100 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-semibold shadow-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monthly Savings Goal (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editGoal}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setEditGoal(val);
                      }
                    }}
                    className="block w-full pl-9 pr-3 py-2.5 bg-white border border-pink-100 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-semibold shadow-sm"
                    placeholder="e.g. 10000"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-500/5 border border-pink-100 flex items-start">
                <ShieldCheck className="h-4.5 w-4.5 text-pink-500 mr-2.5 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-650 leading-normal font-semibold">
                  <strong className="text-slate-800">Projections & Reallocation:</strong> Saving these numbers will trigger the AI engine to completely recalculate your category budgets and rebuild dashboard graphics immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-bold transition-all text-center uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || modalSuccess}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold rounded-xl text-xs shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 uppercase tracking-wider"
                >
                  {modalLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : <Save className="h-3.5 w-3.5" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
