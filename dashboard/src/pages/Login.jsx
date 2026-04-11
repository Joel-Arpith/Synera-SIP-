import React, { useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Lock, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-danger/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md p-8 glass-card border border-white/10 z-10 mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-cyan-primary/20 p-4 rounded-2xl border border-cyan-primary/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="text-cyan-primary h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CyberIDS Access</h1>
          <p className="text-gray-400 text-sm">Security Operations Center Authentication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-danger text-sm animate-shake">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-border/30 border border-border text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary transition-all bg-white/5"
                placeholder="admin@cyberids.local"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-border/30 border border-border text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-primary focus:ring-1 focus:ring-cyan-primary transition-all bg-white/5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-primary hover:bg-cyan-secondary text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] shadow-cyan-primary/20"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Initialize Session'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <span>Protected by AES-256 Encryption</span>
          <span className="text-gray-700">© 2026 CyberIDS Security Systems</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
