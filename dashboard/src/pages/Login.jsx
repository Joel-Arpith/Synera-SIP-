import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
           <div className="h-16 w-16 bg-[#111118] border border-[#2a2a3a] flex items-center justify-center rounded-[20px] shadow-glow">
              <Shield className="text-[#6366f1]" size={32} />
           </div>
           <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#f8fafc]">Synera</h1>
              <p className="text-[#94a3b8] text-sm">Initialize secure session to access dashboard</p>
           </div>
        </div>

        {/* Card Form */}
        <div className="glass-card p-10 space-y-8">
           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest pl-1">Administrator Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" size={18} />
                       <input 
                         type="email" 
                         required
                         className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] text-[#f8fafc] h-12 pl-12 pr-4 rounded-[10px] outline-none transition-all"
                         placeholder="admin@synera-ids.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#475569] uppercase tracking-widest pl-1">Secure Keyphrase</label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" size={18} />
                       <input 
                         type="password" 
                         required
                         className="w-full bg-[#0a0a0f] border border-[#2a2a3a] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] text-[#f8fafc] h-12 pl-12 pr-4 rounded-[10px] outline-none transition-all"
                         placeholder="••••••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-[#ef444410] border border-[#ef444430] rounded-[10px] text-[#ef4444] text-xs animate-fade">
                   <AlertCircle size={14} className="shrink-0" />
                   {error}
                </div>
              )}

              <div className="space-y-4 pt-2">
                 <button 
                   disabled={loading}
                   className="w-full h-14 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-[#6366f120]"
                 >
                    {loading ? (
                       <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Sign In'}
                 </button>
                 
                 <div className="text-center">
                    <button type="button" className="text-xs text-[#475569] hover:text-[#6366f1] transition-colors">Forgot password?</button>
                 </div>
              </div>
           </form>
        </div>

        <div className="mt-12 text-center text-[10px] text-[#475569] tracking-[0.2em] font-bold uppercase">
           End-to-End Cryptographic Protection Active
        </div>
      </div>
    </div>
  );
};

export default Login;
