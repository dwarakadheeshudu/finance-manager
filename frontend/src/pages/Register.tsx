import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_bottom_left,_rgba(255,182,193,0.18),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(255,204,213,0.15),_transparent_45%),#ffffff] px-4 font-sans relative overflow-hidden">
      {/* Global Public Main Menu */}
      <Navbar />
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-90 h-90 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-90 h-90 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-600 mb-3.5">
            <Sparkles className="h-4 w-4 text-pink-500 animate-glow" />
            AI Onboarding
          </div>
          <h2 className="text-3xl font-extrabold text-gradient tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500 font-semibold tracking-wide">Join SmartFinance AI to optimize your savings today</p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-pink-100/80 shadow-xl bg-white/80">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 text-rose-600 text-sm font-semibold flex items-center shadow-sm">
              <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 text-sm font-semibold flex items-center animate-pulse shadow-sm">
              <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />
              <span>Account created successfully! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 bg-white border border-pink-200 rounded-xl text-sm text-slate-900 placeholder-slate-450 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 transition-all font-semibold shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-400 to-pink-550 hover:from-pink-500 hover:to-pink-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all flex items-center justify-center transform active:scale-98 uppercase tracking-wider mt-2"
            >
              {loading ? (
                <RefreshCw className="h-4.5 w-4.5 animate-spin mr-2" />
              ) : null}
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <span className="text-sm text-slate-500 font-semibold">Already have an account? </span>
            <Link to="/login" className="text-sm text-pink-600 hover:text-pink-700 font-bold transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
