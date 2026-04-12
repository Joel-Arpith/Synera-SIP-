import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Design Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#007aff]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-black/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10 animate-fade">
        {/* Apple-style Identity */}
        <div className="flex flex-col items-center gap-6 mb-12">
           <div className="h-20 w-20 bg-white border border-[#d2d2d7]/30 flex items-center justify-center rounded-[22px] shadow-xl">
              <Shield className="text-black" size={36} strokeWidth={2.5} />
           </div>
           <div className="text-center space-y-2">
              <h1 className="text-[32px] font-bold tracking-tight text-black">Sign In</h1>
              <p className="text-[#86868b] text-[15px] font-medium">Access your Synera edge telemetry.</p>
           </div>
        </div>

        {/* Authentication Form */}
        <div className="bg-white border border-[#d2d2d7]/50 rounded-[28px] p-10 shadow-2xl space-y-8">
           <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[12px] font-bold text-black/50 uppercase tracking-wide pl-1">Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#afafb6] group-focus-within:text-black transition-colors" size={18} />
                       <input 
                         type="email" 
                         required
                         className="w-full bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black/20 text-black h-13 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium"
                         placeholder="admin@synera.in"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[12px] font-bold text-black/50 uppercase tracking-wide pl-1">Passcode</label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#afafb6] group-focus-within:text-black transition-colors" size={18} />
                       <input 
                         type="password" 
                         required
                         className="w-full bg-[#f5f5f7] border border-transparent focus:bg-white focus:border-black/20 text-black h-13 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium"
                         placeholder="••••••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-[#ff3b30]/5 border border-[#ff3b30]/10 rounded-2xl text-[#ff3b30] text-[13px] font-medium animate-fade">
                   <AlertCircle size={15} className="shrink-0" />
                   {error}
                </div>
              )}

              <div className="space-y-6 pt-4">
                 <button 
                   disabled={loading}
                   className="w-full h-14 bg-black hover:bg-[#1d1d1f] text-white font-bold text-[16px] rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                 >
                    {loading ? (
                       <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Initialize Session
                        <ArrowRight size={18} />
                      </>
                    )}
                 </button>
                 
                 <div className="text-center">
                    <button type="button" className="text-[14px] text-[#007aff] font-semibold hover:underline">Trouble logging in?</button>
                 </div>
              </div>
           </form>
        </div>

        <div className="mt-12 text-center text-[12px] text-[#afafb6] font-semibold uppercase tracking-widest">
           Secure Edge Partition: SYNERA-SIP-V2
        </div>
      </div>
    </div>
  );
};

export default Login;
