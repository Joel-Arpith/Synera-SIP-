import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Ban, 
  Globe, 
  Database, 
  Cpu, 
  TrendingUp, 
  CheckCircle,
  Brain,
  Wifi,
  Search,
  ChevronDown
} from 'lucide-react';
import Badge from '../components/Badge';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mockAlerts, setMockAlerts] = useState([
     { sig: 'ET SCAN Nmap probe', sev: 'high', time: '10:45:02' }
  ]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Hero Animation Logic
    const alertInterval = setInterval(() => {
       const signatures = [
         'ET SCAN libssh brute force',
         'ET WEB_SPECIFIC_APPS Drupal exploit',
         'ET POLICY IP Check response',
         'ET EXPLOIT DNS Amplification'
       ];
       const newAlert = {
         sig: signatures[Math.floor(Math.random() * signatures.length)],
         sev: Math.random() > 0.5 ? 'high' : 'critical',
         time: new Date().toLocaleTimeString([], { hour12: false })
       };
       setMockAlerts(prev => [newAlert, ...prev].slice(0, 3));
    }, 4000);

    // Flow Animation Logic
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(alertInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f8fafc]">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#2a2a3a] py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Shield className="text-[#6366f1]" size={28} />
             <span className="text-xl font-bold tracking-tight">Synera</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-[#94a3b8]">
             <a href="#features" className="hover:text-white transition-colors">Features</a>
             <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
             <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
             <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
             <Link to="/login" className="text-sm font-medium text-[#94a3b8] hover:text-white px-4 py-2 transition-colors">Sign In</Link>
             <button className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-semibold px-6 py-2.5 rounded-[10px] transition-all">
                Download Now
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f115] border border-[#6366f130]">
               <span className="text-[11px] font-bold text-[#6366f1] tracking-wider uppercase">🛡 Trusted by 500+ businesses</span>
            </div>
            
            <h1 className="text-[56px] leading-[1.1] font-bold tracking-tight">
               Your Business Is Being <br />
               <span className="text-[#6366f1]">Watched.</span> Are You?
            </h1>
            
            <p className="text-xl text-[#94a3b8] max-w-[560px] leading-relaxed">
               Synera detects cyber threats in real-time before they become disasters. Built for small businesses who deserve enterprise-grade protection.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
               <button className="bg-[#6366f1] hover:bg-[#4f46e5] h-14 px-8 text-base font-bold shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  Download Now
               </button>
               <button className="bg-transparent border border-[#2a2a3a] hover:bg-[#1a1a24] h-14 px-8 text-base font-bold">
                  See Live Demo
               </button>
            </div>

            <div className="pt-20 flex flex-wrap gap-x-12 gap-y-6 opacity-30 grayscale pointer-events-none">
               <span className="text-sm font-bold uppercase tracking-widest">Powered by Suricata</span>
               <span className="text-sm font-bold uppercase tracking-widest">Supabase Secured</span>
               <span className="text-sm font-bold uppercase tracking-widest">AI Analysis</span>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative">
             <div className="absolute -inset-10 bg-[#6366f1] opacity-[0.03] blur-[100px] rounded-full" />
             <div className="glass-card shadow-2xl relative animate-slide-up bg-[#0d0d14] overflow-hidden">
                <div className="h-10 bg-[#1a1a24] border-b border-[#2a2a3a] flex items-center px-4 gap-2">
                   <div className="h-2 w-2 rounded-full bg-[#ef4444]" />
                   <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                   <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                   <span className="ml-4 text-[10px] font-mono text-[#475569]">ssh admin@synera-ids-pi-4</span>
                </div>
                
                <div className="p-8 space-y-8 h-[440px]">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#111118] border border-[#2a2a3a] p-4 rounded-xl">
                         <p className="text-[10px] font-bold text-[#475569] uppercase mb-1">Total Alerts</p>
                         <p className="text-2xl font-bold font-mono">0</p>
                      </div>
                      <div className="bg-[#111118] border border-[#2a2a3a] p-4 rounded-xl">
                         <p className="text-[10px] font-bold text-[#475569] uppercase mb-1">Threats Blocked</p>
                         <p className="text-2xl font-bold font-mono text-[#ef4444]">0</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#6366f1] tracking-widest uppercase">Live Security Stream</p>
                      <div className="space-y-2">
                        {mockAlerts.map((a, i) => (
                           <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 animate-fade">
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-mono text-[#475569]">{a.time}</span>
                                 <span className="text-xs font-semibold truncate max-w-[140px]">{a.sig}</span>
                              </div>
                              <Badge type={a.sev}>{a.sev}</Badge>
                           </div>
                        ))}
                      </div>
                   </div>

                   <div className="h-24 bg-[#6366f110] border border-[#6366f120] rounded-xl flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-[#6366f1] animate-ping" />
                         <p className="text-[11px] font-bold text-[#6366f1] tracking-widest uppercase">System Monitoring Active</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[#1e1e2e] bg-[#111118]/50">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-3">
             <h2 className="text-[48px] font-bold tracking-tight">40,000+</h2>
             <p className="text-[#94a3b8] font-medium tracking-wide uppercase text-sm">Threat Signatures</p>
          </div>
          <div className="space-y-3">
             <h2 className="text-[48px] font-bold tracking-tight text-[#6366f1]">&lt;3s</h2>
             <p className="text-[#94a3b8] font-medium tracking-wide uppercase text-sm">Detection Time</p>
          </div>
          <div className="space-y-3">
             <h2 className="text-[48px] font-bold tracking-tight">99.9%</h2>
             <p className="text-[#94a3b8] font-medium tracking-wide uppercase text-sm">Uptime Guarantee</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <span className="text-[11px] font-bold text-[#6366f1] tracking-[3px] uppercase">Capabilities</span>
             <h2 className="text-3xl font-bold">Everything you need to stay protected</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Real-Time Detection', text: 'Suricata IDS engine monitors every packet on your network, 24/7.' },
              { icon: Zap, title: 'AI Threat Explanation', text: 'Claude AI explains every alert in plain English — no security degree required.' },
              { icon: Ban, title: 'Auto-Block Attackers', text: 'Malicious IPs are automatically blocked the moment they cross your threshold.' },
              { icon: Globe, title: 'Global Threat Map', text: 'See exactly where attacks are coming from on a live world map.' },
              { icon: Database, title: '40,000+ Signatures', text: 'Emerging Threats ruleset keeps you protected against known attack patterns.' },
              { icon: Cpu, title: 'Runs on Raspberry Pi', text: 'Deploy on affordable hardware. Full enterprise protection for under $100 setup cost.' },
            ].map((f, i) => (
              <div key={i} className="glass-card p-8 group hover:translate-y-[-2px] hover:shadow-elevated transition-all duration-300">
                 <div className="h-12 w-12 bg-[#6366f110] text-[#6366f1] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon size={24} />
                 </div>
                 <h3 className="text-lg font-bold mb-3">{f.title}</h3>
                 <p className="text-sm text-[#94a3b8] leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-[#111118]/50 border-y border-[#1e1e2e] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-3xl font-bold">From packet to protection in seconds</h2>
          </div>
          
          <div className="relative">
             <div className="absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-[#1e1e2e]" />
             <div className="absolute top-[28px] left-[40px] h-[2px] bg-[#6366f1] transition-all duration-1000" style={{ width: `${(activeStep / 3) * 100}%` }} />
             
             <div className="grid grid-cols-4 gap-4 relative">
                {[
                  { icon: Wifi, title: 'Network Traffic', desc: 'Traffic enters your network' },
                  { icon: Search, title: 'Suricata Scans', desc: 'Deep packet inspection fires' },
                  { icon: Brain, title: 'AI Analyzes', desc: 'Claude explains the threat' },
                  { icon: Shield, title: 'Auto-Response', desc: 'Attacker blocked instantly' },
                ].map((s, i) => (
                   <div key={i} className="flex flex-col items-center gap-6 text-center">
                      <div className={`h-14 w-14 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${activeStep === i ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-[#0a0a0f] border-[#2a2a3a] text-[#475569]'}`}>
                         <s.icon size={24} />
                      </div>
                      <div className="space-y-2">
                         <p className={`text-sm font-bold transition-colors ${activeStep === i ? 'text-white' : 'text-[#475569]'}`}>{s.title}</p>
                         <p className="text-xs text-[#94a3b8] hidden md:block">{s.desc}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
             <p className="text-[#94a3b8]">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
             {/* Starter */}
             <div className="glass-card p-10 space-y-8 flex flex-col">
                <div className="space-y-2">
                   <h3 className="text-xl font-bold">Starter</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹999</span>
                      <span className="text-[#94a3b8]">/mo</span>
                   </div>
                   <p className="text-xs text-[#94a3b8]">For solo entrepreneurs</p>
                </div>
                <div className="flex-1 space-y-4">
                   {[
                     '1 network monitored',
                     'Up to 1,000 alerts/day',
                     'AI explanations',
                     'Email notifications',
                     'Community support'
                   ].map(t => (
                      <div key={t} className="flex items-center gap-3 text-sm text-[#94a3b8]">
                         <CheckCircle size={14} className="text-[#10b981]" />
                         {t}
                      </div>
                   ))}
                </div>
                <button className="w-full btn-ghost py-4 font-bold">Download Now</button>
             </div>

             {/* Business - Featured */}
             <div className="glass-card border-[#6366f1] shadow-glow p-12 space-y-8 flex flex-col transform md:scale-110 relative z-20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                   Most Popular
                </div>
                <div className="space-y-2 text-center">
                   <h3 className="text-xl font-bold">Business</h3>
                   <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">₹2,999</span>
                      <span className="text-[#94a3b8]">/mo</span>
                   </div>
                   <p className="text-xs text-[#94a3b8]">For small teams (5-50 employees)</p>
                </div>
                <div className="flex-1 space-y-4">
                   {[
                     '3 networks monitored',
                     'Unlimited alerts',
                     'AI reports & insights',
                     'Auto-block engine',
                     'Priority email support',
                     'Full threat map'
                   ].map(t => (
                      <div key={t} className="flex items-center gap-3 text-sm text-[#f8fafc]">
                         <CheckCircle size={16} className="text-[#6366f1]" />
                         {t}
                      </div>
                   ))}
                </div>
                <button className="w-full bg-[#6366f1] text-white py-4 font-bold shadow-lg">Download Now</button>
             </div>

             {/* Enterprise */}
             <div className="glass-card p-10 space-y-8 flex flex-col">
                <div className="space-y-2">
                   <h3 className="text-xl font-bold">Enterprise</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹7,999</span>
                      <span className="text-[#94a3b8]">/mo</span>
                   </div>
                   <p className="text-xs text-[#94a3b8]">For multi-location businesses</p>
                </div>
                <div className="flex-1 space-y-4">
                   {[
                     'Unlimited networks',
                     'Custom detection rules',
                     'Dedicated support agent',
                     '99.9% SLA guarantee',
                     'On-site assistance'
                   ].map(t => (
                      <div key={t} className="flex items-center gap-3 text-sm text-[#94a3b8]">
                         <CheckCircle size={14} className="text-[#10b981]" />
                         {t}
                      </div>
                   ))}
                </div>
                <button className="w-full btn-ghost py-4 font-bold">Contact Us</button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#0a0a0f] border-t border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-12">
           <div className="flex items-center gap-3">
              <Shield className="text-[#6366f1]" size={32} />
              <span className="text-2xl font-bold tracking-tight">Synera</span>
           </div>
           
           <div className="flex items-center gap-8 text-sm text-[#94a3b8]">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
           </div>

           <div className="space-y-2">
              <p className="text-[#475569] text-xs">Built with ❤️ by Team Synera in a dorm room.</p>
              <p className="text-[#475569] text-xs">© 2026 Synera. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
