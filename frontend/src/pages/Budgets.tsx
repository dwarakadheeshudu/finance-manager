import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, Sparkles, Check, AlertCircle, Edit3, IndianRupee, RefreshCw } from 'lucide-react';

interface BudgetStatus {
  id: number;
  category: string;
  limit_amount: number;
  percentage: number;
  spent: number;
  percentage_used: number;
  remaining: number;
  is_exceeded: boolean;
}

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLimit, setEditLimit] = useState<number>(0);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Automation states
  const [autoLoading, setAutoLoading] = useState(false);

  const handleAutoAdjust = async () => {
    if (!user) return;
    setAutoLoading(true);
    setMessage('');
    
    const availableSpending = Math.max(0, user.monthly_salary - user.savings_goal);
    
    // Default optimal AI proportions
    const proportions: { [key: string]: number } = {
      'Bills': 0.25,
      'Food': 0.20,
      'Emergency': 0.125,
      'Travel': 0.125,
      'Others': 0.125,
      'Shopping': 0.10,
      'Entertainment': 0.075,
      'Healthcare': 0.05,
      'Education': 0.05,
    };

    try {
      for (const b of budgets) {
        let prop = 0.05; // Default fallback allocation
        for (const [key, value] of Object.entries(proportions)) {
          if (b.category.toLowerCase().includes(key.toLowerCase())) {
            prop = value;
            break;
          }
        }
        
        const newLimit = Math.round(availableSpending * prop);
        if (newLimit > 0 && newLimit !== b.limit_amount) {
          await api.put(`/budgets/${b.id}`, { limit_amount: newLimit });
        }
      }
      
      setMessage('AI Auto-Adjusted category budgets successfully!');
      await fetchBudgetStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAutoLoading(false);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const res = await api.get('/budgets/status');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetStatus();
  }, []);

  const handleEditClick = (b: BudgetStatus) => {
    setEditingId(b.id);
    setEditLimit(b.limit_amount);
    setMessage('');
  };

  const handleSaveLimit = async (id: number) => {
    setSaveLoading(true);
    try {
      await api.put(`/budgets/${id}`, { limit_amount: editLimit });
      setEditingId(null);
      setMessage('Budget limit adjusted successfully!');
      await fetchBudgetStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="h-10 w-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const availableSpending = Math.max(0, (user?.monthly_salary || 0) - (user?.savings_goal || 0));
  const totalAllocated = budgets.reduce((sum, b) => sum + b.limit_amount, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Available Spending Pool</span>
          <p className="text-2xl font-black text-slate-800 mt-2">₹{availableSpending.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Salary minus savings target</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Budget Allocated</span>
          <p className="text-2xl font-black text-slate-800 mt-2">₹{totalAllocated.toLocaleString()}</p>
          <p className={`text-xs mt-1 font-bold ${totalAllocated > availableSpending ? 'text-rose-600' : 'text-slate-400'}`}>
            {totalAllocated > availableSpending ? '⚠️ Exceeds Available spending cap' : 'Allocations within budget limit'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-pink-100 shadow-md bg-white/80">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Remaining Unallocated</span>
          <p className="text-2xl font-black text-slate-800 mt-2">₹{Math.max(0, availableSpending - totalAllocated).toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Cash buffer for categories</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-sm font-semibold flex items-center shadow-sm">
          <Check className="h-4.5 w-4.5 mr-2" />
          <span>{message}</span>
        </div>
      )}

      {/* Budgets List */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl bg-white/80 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="h-5 w-5 text-pink-500" />
              Category Budgets and Limits
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Configure individual limits and monitor real-time monthly usage meters.</p>
          </div>
          
          <button
            onClick={handleAutoAdjust}
            disabled={autoLoading}
            className="px-4 py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 animate-glow"
          >
            {autoLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-pink-500" />
            ) : <Sparkles className="h-3.5 w-3.5 text-pink-500 animate-pulse" />}
            {autoLoading ? 'Reallocating...' : 'AI Auto-Adjust Limits'}
          </button>
        </div>

        <div className="space-y-6">
          {budgets.map((b) => {
            const meterColor = 
              b.percentage_used >= 100 ? 'bg-rose-500' :
              b.percentage_used >= 80 ? 'bg-amber-500' :
              'bg-emerald-500';
              
            const isEditing = editingId === b.id;

            return (
              <div key={b.id} className="p-5 rounded-2xl bg-white border border-pink-100/70 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-sm">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800">{b.category}</span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Spent: <strong className="text-slate-800">₹{b.spent.toLocaleString()}</strong> of ₹{b.limit_amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div className="w-full bg-pink-50/50 border border-pink-100/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${meterColor}`} 
                      style={{ width: `${Math.min(100, b.percentage_used)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                    <span>{b.percentage_used.toFixed(0)}% consumed</span>
                    {b.is_exceeded ? (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Exceeded by ₹{Math.abs(b.remaining).toLocaleString()}
                      </span>
                    ) : (
                      <span>₹{b.remaining.toLocaleString()} left</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-450">
                          <IndianRupee className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(Number(e.target.value))}
                          className="w-28 pl-7 pr-2 py-1.5 text-xs bg-white border border-pink-200 rounded-lg text-slate-800 focus:outline-none focus:border-pink-400 font-semibold"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveLimit(b.id)}
                        disabled={saveLoading}
                        className="px-3.5 py-1.5 bg-pink-400 hover:bg-pink-550 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(b)}
                      className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl transition-all border border-pink-200/50 flex items-center gap-1.5 text-xs font-bold shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit limit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
