import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, IndianRupee, Landmark, Save, ShieldCheck, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react';

const Setup: React.FC = () => {
  const { user, setupFinancials } = useAuth();
  const navigate = useNavigate();

  const [salary, setSalary] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllocations, setShowAllocations] = useState(false);

  // Initialize values when user details are loaded
  useEffect(() => {
    if (user) {
      setSalary(user.monthly_salary > 0 ? user.monthly_salary.toString() : '');
      setGoal(user.savings_goal > 0 ? user.savings_goal.toString() : '');
    }
  }, [user]);

  const salaryNum = Number(salary) || 0;
  const goalNum = Number(goal) || 0;
  
  // Available spending allocation forecast
  const availableSpending = Math.max(0, salaryNum - goalNum);
  const projectedAllocations = [
    { category: 'Bills (25%)', amount: availableSpending * 0.25, desc: 'Rent, electricity, internet, subscriptions' },
    { category: 'Food (20%)', amount: availableSpending * 0.20, desc: 'Groceries, restaurants, food delivery' },
    { category: 'Emergency Fund (12.5%)', amount: availableSpending * 0.125, desc: 'Medical expense backups, unforeseen repairs' },
    { category: 'Travel (12.5%)', amount: availableSpending * 0.125, desc: 'Commuting, fuel, flight bookings' },
    { category: 'Others (12.5%)', amount: availableSpending * 0.125, desc: 'Unplanned expenses and cash buffer' },
    { category: 'Shopping (10%)', amount: availableSpending * 0.10, desc: 'Apparel, accessories, home decor' },
    { category: 'Entertainment (7.5%)', amount: availableSpending * 0.075, desc: 'Movies, concerts, gaming, hobbies' },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (salaryNum <= 0) {
      setError('Monthly salary must be greater than zero.');
      return;
    }
    if (goalNum < 0) {
      setError('Savings target cannot be negative.');
      return;
    }
    if (goalNum > salaryNum) {
      setError('Savings target cannot exceed monthly salary.');
      return;
    }
    setError('');
    setShowAllocations(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setupFinancials(salaryNum, goalNum);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Saving financials failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_bottom_left,_rgba(255,182,193,0.18),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(255,204,213,0.15),_transparent_45%),#ffffff] px-4 py-12 font-sans relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-650 mb-4 animate-glow">
            <Sparkles className="h-4 w-4 text-pink-500 animate-glow" />
            AI Financial Setup
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gradient tracking-tight">Onboarding Configuration</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-semibold">
            Configure your monthly active income and target savings to initialize automated budgeting pipelines.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-pink-100/80 shadow-xl relative overflow-hidden bg-white/80">
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,133,161,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,133,161,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          {/* Escape Option: Back to main menu dashboard */}
          <div className="flex justify-end mb-6 relative z-10">
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-350 text-slate-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-sm font-semibold flex items-center shadow-sm">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!showAllocations ? (
            <form onSubmit={handleNext} className="space-y-6 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider mb-2">Monthly Salary (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setSalary(val);
                      }
                    }}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                    placeholder="Enter monthly salary (e.g. 75000)"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-normal font-semibold">
                  Your primary active income pool (e.g. career payroll, freelance retainers, investment payouts).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider mb-2">Monthly Savings Goal (₹)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={goal}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                        setGoal(val);
                      }
                    }}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                    placeholder="Enter target savings (e.g. 15000)"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-normal font-semibold">
                  The amount you wish to save each month. The remainder will be divided as your spendable limit.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-pink-500/5 border border-pink-500/10 flex items-start shadow-inner">
                <ShieldCheck className="h-5.5 w-5.5 text-pink-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-650 leading-relaxed font-semibold">
                  <span className="font-bold text-slate-800 block mb-0.5">Automated Allocation Projections:</span> 
                  Based on these figures, our AI engine will construct an Available Spending Pool of <strong className="text-pink-650">₹{availableSpending.toLocaleString()}</strong> and distribute it into optimized category limits.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 bg-gradient-to-r from-pink-450 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all transform active:scale-98 text-center uppercase tracking-wider"
              >
                Project AI Allocations
              </button>
            </form>
          ) : (
            <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">AI Budget Recommendations</h3>
                    <p className="text-sm text-slate-500 mt-1 font-semibold">
                      Based on your savings goals, the AI divided your spendable limit (₹{availableSpending.toLocaleString()}) as follows:
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-xs font-bold text-emerald-650 flex items-center gap-1 shadow-sm">
                    <TrendingUp className="h-3.5 w-3.5" /> System Ready
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {projectedAllocations.map((alloc) => (
                  <div key={alloc.category} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-pink-100/60 hover:border-pink-200 transition-all group shadow-sm">
                    <div className="text-left">
                      <span className="text-sm font-bold text-slate-700 block">{alloc.category}</span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-655 transition-colors font-semibold">{alloc.desc}</span>
                    </div>
                    <span className="text-sm font-bold text-pink-650">
                      ₹{alloc.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowAllocations(false)}
                  className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-650 border border-slate-200 hover:border-slate-350 font-bold rounded-xl text-xs transition-all text-center uppercase tracking-wider"
                >
                  Adjust Numbers
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98 uppercase tracking-wider"
                >
                  {loading && <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                  <Save className="h-4 w-4" />
                  Confirm & Initialize
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;
