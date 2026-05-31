import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Receipt, Plus, Trash2, Calendar, Filter, Sparkles, Check, AlertCircle, 
  HelpCircle, ChevronDown, ListFilter, Play, Edit3, RefreshCw, X, Save
} from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  category: string;
  expense_text: string;
  confidence: number;
  date: string;
}

const CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 
  'Healthcare', 'Education', 'Investments', 'Savings', 'Emergency', 'Others'
];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal states
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Food');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Simulation states
  const [simulateLoading, setSimulateLoading] = useState(false);

  const mockExpenses = [
    "Paid ₹2400 for monthly high-speed broadband internet subscription",
    "Bought fresh organic fruits and groceries at store for ₹1850",
    "Spent ₹340 on Uber cab ride to office",
    "Spent ₹1250 on a movie ticket and popcorn with friends",
    "Paid ₹4500 for electricity bill",
    "Bought a stylish new winter jacket for ₹3200",
    "Paid ₹600 for pharmacy medicines",
    "Bought professional development textbooks for ₹1400",
    "Allocated ₹5000 towards emergency savings vault"
  ];
  
  // Filtering states
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states (Manual Entry)
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // NLP States
  const [nlpText, setNlpText] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpSuccess, setNlpSuccess] = useState(false);
  const [nlpError, setNlpError] = useState('');

  const fetchExpenses = async () => {
    try {
      let url = '/expenses/?';
      if (filterCategory) url += `category=${filterCategory}&`;
      if (startDate) url += `start_date=${new Date(startDate).toISOString()}&`;
      if (endDate) url += `end_date=${new Date(endDate).toISOString()}&`;
      
      const res = await api.get(url);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, startDate, endDate]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await api.post('/expenses/', {
        amount: Number(amount),
        category,
        expense_text: desc || 'Manual Log',
        date: date ? new Date(date).toISOString() : undefined
      });
      setFormSuccess(true);
      setAmount('');
      setDesc('');
      setDate('');
      await fetchExpenses();
      setTimeout(() => {
        setFormSuccess(false);
        setShowManualForm(false);
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to log expense.');
    } finally {
      setFormLoading(false);
    }
  };

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
      await fetchExpenses();
      setTimeout(() => setNlpSuccess(false), 3000);
    } catch (err: any) {
      setNlpError(err.response?.data?.detail || 'Could not parse transaction details.');
    } finally {
      setNlpLoading(false);
    }
  };

  const handleEditClick = (e: Expense) => {
    setEditingExpense(e);
    setEditAmount(e.amount.toString());
    setEditCategory(e.category);
    setEditDesc(e.expense_text);
    setEditDate(e.date ? new Date(e.date).toISOString().split('T')[0] : '');
    setEditError('');
    setEditSuccess(false);
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingExpense) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);

    try {
      await api.put(`/expenses/${editingExpense.id}`, {
        amount: Number(editAmount),
        category: editCategory,
        expense_text: editDesc || 'Manual Log',
        date: editDate ? new Date(editDate).toISOString() : undefined
      });
      setEditSuccess(true);
      await fetchExpenses();
      setTimeout(() => {
        setEditingExpense(null);
      }, 1500);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update transaction.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAutoSimulate = async () => {
    setSimulateLoading(true);
    try {
      const shuffled = [...mockExpenses].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 4);
      for (const phrase of selected) {
        await api.post('/expenses/nlp', { expense_text: phrase });
      }
      await fetchExpenses();
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulateLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Quick AI Logger */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl bg-gradient-premium relative overflow-hidden bg-white/80">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles className="h-24 w-24 text-pink-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500 animate-glow" />
            AI Expense Categorizer
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Submit description in natural language and the model will parse details.</p>
          
          <form onSubmit={handleNlpSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              placeholder="e.g. Spent ₹350 on Uber ride, Paid ₹2000 for groceries at store, Netflix ₹199"
              className="flex-1 px-4 py-3.5 text-sm glass-input rounded-xl focus:outline-none placeholder-slate-400 font-semibold shadow-inner"
            />
            <button
              type="submit"
              disabled={nlpLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {nlpLoading ? (
                <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : <Play className="h-4.5 w-4.5 fill-white" />}
              Parse Text
            </button>
          </form>

          {nlpSuccess && (
            <div className="mt-3 text-sm text-emerald-600 flex items-center gap-1.5 animate-pulse font-semibold">
              <Check className="h-4.5 w-4.5" /> Transaction logged and categorized successfully!
            </div>
          )}
          {nlpError && (
            <div className="mt-3 text-sm text-rose-600 flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-4.5 w-4.5" /> {nlpError}
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Toggle & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="px-5 py-3 bg-pink-50 hover:bg-pink-100/80 border border-pink-200/60 text-pink-700 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm active:scale-95 animate-glow"
          >
            <Plus className="h-4.5 w-4.5 text-pink-500" />
            {showManualForm ? 'Hide manual entry' : 'Log transaction manually'}
          </button>
          
          <button
            onClick={handleAutoSimulate}
            disabled={simulateLoading}
            className="px-5 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200/60 text-pink-700 rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-sm active:scale-95 animate-glow"
          >
            {simulateLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-pink-550 mr-1" />
            ) : <Sparkles className="h-4 w-4 text-pink-500 animate-pulse mr-1" />}
            {simulateLoading ? 'Auto-Simulating...' : 'AI Auto-Simulate Spends'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="h-4 w-4 text-pink-500" /> Filters:
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
          />
        </div>
      </div>

      {/* Manual Form */}
      {showManualForm && (
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl max-w-xl transition-all bg-white/80">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Manual Transaction Logger</h3>
          {formSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-sm font-semibold flex items-center shadow-sm">
              <Check className="h-4.5 w-4.5 mr-2" /> Saving complete!
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-sm font-semibold flex items-center shadow-sm">
              <AlertCircle className="h-4.5 w-4.5 mr-2" /> {formError}
            </div>
          )}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  placeholder="Lunch with clients"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date (Optional)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {formLoading && <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              Log Expense manually
            </button>
          </form>
        </div>
      )}

      {/* Expenses Table list */}
      <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl overflow-hidden bg-white/80 animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="h-5 w-5 text-pink-500" />
            Transaction History
          </h2>
          <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Logged: {expenses.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-20 text-sm text-slate-500 font-semibold">No transaction logs match current filters. Try adding one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-pink-100 text-slate-450 text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Input Text / Description</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 text-right">Amount (₹)</th>
                  <th className="py-4 px-4 text-center">AI Confidence</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {expenses.map((e) => {
                  const isManual = e.expense_text === 'Manual Log';
                  const badgeColor = isManual 
                    ? 'bg-slate-100 border border-slate-200 text-slate-500' 
                    : 'bg-pink-100/80 border border-pink-200 text-pink-700';
                  
                  return (
                    <tr key={e.id} className="text-slate-600 text-sm hover:bg-pink-50/15 transition-all">
                      <td className="py-4.5 px-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-pink-400" />
                        {new Date(e.date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                      </td>
                      <td className="py-4.5 px-4 font-semibold text-slate-800">{e.expense_text}</td>
                      <td className="py-4.5 px-4">
                        <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-xs text-pink-700 font-bold">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-right font-black text-slate-800">₹{e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="py-4.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${badgeColor}`}>
                          {isManual ? 'Manual' : `${e.confidence.toFixed(0)}%`}
                        </span>
                      </td>
                      <td className="py-4.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(e)}
                            className="p-2 bg-pink-550/10 hover:bg-pink-500/20 border border-pink-200/65 text-pink-700 rounded-xl transition-all shadow-sm active:scale-95"
                            title="Edit transaction"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all shadow-sm active:scale-95"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT TRANSACTION MODAL */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md transition-opacity duration-300">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-pink-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 bg-white">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-extrabold text-slate-800">Edit Transaction</h3>
              </div>
              <button 
                onClick={() => setEditingExpense(null)}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-pink-650 hover:border-pink-300 transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-xs font-semibold flex items-center shadow-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-xs font-semibold flex items-center animate-pulse shadow-sm">
                <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Transaction updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-805 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date (Optional)</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-650 rounded-xl text-xs font-bold transition-all text-center uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || editSuccess}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-bold rounded-xl text-xs shadow-md shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-98 uppercase tracking-wider"
                >
                  {editLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : <Save className="h-3.5 w-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
