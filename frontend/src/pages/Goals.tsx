import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Plus, Calendar, Trash2, CheckCircle2, TrendingUp, HelpCircle, Save, AlertCircle, Edit3, X, RefreshCw } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_completed: boolean;
}

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Add goal)
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [date, setDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // States for incrementing progress
  const [progressId, setProgressId] = useState<number | null>(null);
  const [addProgressAmount, setAddProgressAmount] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);

  // Edit Goal states
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editCurrent, setEditCurrent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/savings/');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await api.post('/savings/', {
        title,
        target_amount: Number(target),
        current_amount: Number(current) || 0.0,
        target_date: new Date(date).toISOString()
      });
      setFormSuccess(true);
      setTitle('');
      setTarget('');
      setCurrent('');
      setDate('');
      await fetchGoals();
      setTimeout(() => {
        setFormSuccess(false);
        setShowAddForm(false);
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save savings goal.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleIncrementProgress = async (goal: Goal) => {
    if (!addProgressAmount || Number(addProgressAmount) <= 0) return;
    
    setProgressLoading(true);
    const newAmount = goal.current_amount + Number(addProgressAmount);
    
    try {
      await api.put(`/savings/${goal.id}`, { current_amount: newAmount });
      setAddProgressAmount('');
      setProgressId(null);
      await fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleEditClick = (g: Goal) => {
    setEditingGoal(g);
    setEditTitle(g.title);
    setEditTarget(g.target_amount.toString());
    setEditCurrent(g.current_amount.toString());
    setEditDate(g.target_date ? new Date(g.target_date).toISOString().split('T')[0] : '');
    setEditError('');
    setEditSuccess(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);

    try {
      await api.put(`/savings/${editingGoal.id}`, {
        title: editTitle,
        target_amount: Number(editTarget),
        current_amount: Number(editCurrent),
        target_date: new Date(editDate).toISOString()
      });
      setEditSuccess(true);
      await fetchGoals();
      setTimeout(() => {
        setEditingGoal(null);
      }, 1500);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update savings goal.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this saving goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-5 w-5 text-pink-500" />
            Savings Goals Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Set up specific financial targets and allocate monthly savings towards milestones.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-750 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 animate-glow"
        >
          <Plus className="h-4.5 w-4.5 text-pink-500" />
          {showAddForm ? 'Hide options' : 'Create new goal'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl max-w-xl transition-all bg-white/80 animate-in fade-in duration-300">
          <h3 className="text-sm font-bold text-slate-850 mb-4 uppercase tracking-wider">Create New Saving Goal</h3>
          {formSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-sm font-semibold flex items-center shadow-sm">
              <CheckCircle2 className="h-4.5 w-4.5 mr-2" /> Goal successfully created!
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-sm font-semibold flex items-center shadow-sm">
              <AlertCircle className="h-4.5 w-4.5 mr-2" /> {formError}
            </div>
          )}
          <form onSubmit={handleAddGoalSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Goal Description / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  placeholder="e.g. Buy a new car, Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Initial Seed Savings (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {formLoading && <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              Initialize Goal
            </button>
          </form>
        </div>
      )}

      {/* Goals listing grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 border border-pink-100 text-center text-sm text-slate-500 shadow-md bg-white/80">
          No current goals set up. Start your savings progress mapping now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
            const isCompleted = g.is_completed || pct >= 100;
            const progressSelected = progressId === g.id;

            return (
              <div key={g.id} className="glass-card rounded-3xl p-6 border border-pink-100 shadow-xl flex flex-col justify-between h-64 hover:border-pink-200/80 transition-all duration-300 bg-white/80">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center">
                        <Target className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{g.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-pink-400" /> Target Date: {new Date(g.target_date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(g)}
                        className="p-1.5 hover:bg-pink-50 border border-transparent hover:border-pink-200 text-slate-450 hover:text-pink-650 rounded-xl transition-all"
                        title="Edit goal"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-slate-450 hover:text-rose-600 rounded-xl transition-all"
                        title="Delete goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="py-4">
                    <div className="flex justify-between items-end text-xs mb-1.5 font-semibold">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-slate-800">₹{g.current_amount.toLocaleString()} / ₹{g.target_amount.toLocaleString()} ({pct}%)</span>
                    </div>

                    <div className="w-full bg-pink-50/50 border border-pink-100/50 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-pink-400 to-fuchsia-555'}`} 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-pink-50 pt-4">
                  {isCompleted ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-4.5 w-4.5" /> Completed Milestone
                    </span>
                  ) : progressSelected ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={addProgressAmount}
                          onChange={(e) => setAddProgressAmount(e.target.value)}
                          placeholder="Amount (₹)"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-pink-200 rounded-lg text-slate-800 focus:outline-none focus:border-pink-400 font-semibold"
                        />
                      </div>
                      <button
                        onClick={() => handleIncrementProgress(g)}
                        disabled={progressLoading}
                        className="px-3.5 py-1.5 bg-emerald-550 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setProgressId(null)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-550 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setProgressId(g.id)}
                        className="text-xs text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1 transition-colors"
                      >
                        <TrendingUp className="h-4.5 w-4.5" /> Deposit savings
                      </button>
                      <span className="text-xs text-slate-500 font-bold">₹{(g.target_amount - g.current_amount).toLocaleString()} remaining</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT GOAL MODAL */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md transition-opacity duration-300">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-pink-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 bg-white">
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-extrabold text-slate-800">Edit Savings Goal</h3>
              </div>
              <button 
                onClick={() => setEditingGoal(null)}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-pink-650 hover:border-pink-300 transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-650 text-xs font-semibold flex items-center shadow-sm">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-xs font-semibold flex items-center animate-pulse shadow-sm">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Savings goal updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Goal Title / Description</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editCurrent}
                    onChange={(e) => setEditCurrent(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-white border border-pink-200 rounded-xl text-xs text-slate-805 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 font-semibold shadow-sm text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-350 text-slate-650 rounded-xl text-xs font-bold transition-all text-center uppercase tracking-wider"
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

export default Goals;
