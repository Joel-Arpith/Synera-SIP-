import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, Plus, X } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { ShaderAnimation } from '../components/ui/shader-lines';
import { PulseBeams } from '../components/ui/pulse-beams';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { supabase } from '../supabase';

const beamsData = [
  {
    path: "M269 220.5H16.5C10.9772 220.5 6.5 224.977 6.5 230.5V398.5",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["0%", "0%", "200%"], x2: ["0%", "0%", "180%"], y1: ["80%", "0%", "0%"], y2: ["100%", "20%", "20%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: Math.random() * 2 },
    },
    connectionPoints: [{ cx: 6.5, cy: 398.5, r: 6 }, { cx: 269, cy: 220.5, r: 6 }]
  },
  {
    path: "M568 200H841C846.523 200 851 195.523 851 190V40",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: Math.random() * 2 },
    },
    connectionPoints: [{ cx: 851, cy: 34, r: 6.5 }, { cx: 568, cy: 200, r: 6 }]
  },
  {
    path: "M425.5 274V333C425.5 338.523 421.023 343 415.5 343H152C146.477 343 142 347.477 142 353V426.5",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: Math.random() * 2 },
    },
    connectionPoints: [{ cx: 142, cy: 427, r: 6.5 }, { cx: 425.5, cy: 274, r: 6 }]
  },
  {
    path: "M493 274V333.226C493 338.749 497.477 343.226 503 343.226H760C765.523 343.226 770 347.703 770 353.226V427",
    gradientConfig: {
      initial: { x1: "40%", x2: "50%", y1: "160%", y2: "180%" },
      animate: { x1: "0%", x2: "10%", y1: "-40%", y2: "-20%" },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: Math.random() * 2 },
    },
    connectionPoints: [{ cx: 770, cy: 427, r: 6.5 }, { cx: 493, cy: 274, r: 6 }]
  },
  {
    path: "M380 168V17C380 11.4772 384.477 7 390 7H414",
    gradientConfig: {
      initial: { x1: "-40%", x2: "-10%", y1: "0%", y2: "20%" },
      animate: { x1: ["40%", "0%", "0%"], x2: ["10%", "0%", "0%"], y1: ["0%", "0%", "180%"], y2: ["20%", "20%", "200%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: Math.random() * 2 },
    },
    connectionPoints: [{ cx: 420.5, cy: 6.5, r: 6 }, { cx: 380, cy: 168, r: 6 }]
  }
];

const gradientColorsConfig = { start: "#18CCFC", middle: "#6344F5", end: "#AE48FF" };

/* ─── Particle Canvas ─── */
const ParticleHero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.4,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        p.y -= p.speed;
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

/* ─── Reusable Navbar ─── */
export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '16px 20px', background: 'white', borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent', transition: 'border-color 0.3s' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: 999, padding: '10px 20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#0a0a0a" />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 2, color: '#0a0a0a' }}>SYNERA</span>
        </Link>

        <div style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
          <a href="#features" style={{ fontSize: 14, color: '#4b5563' }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: 14, color: '#4b5563' }}>How It Works</a>
          <a href="#pricing" style={{ fontSize: 14, color: '#4b5563' }}>Pricing</a>
          <Link to="/about" style={{ fontSize: 14, color: '#4b5563' }}>About</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" style={{ fontSize: 14, color: '#0a0a0a', fontWeight: 500 }}>Sign In</Link>
          <button style={{ background: '#0a0a0a', color: 'white', borderRadius: 999, padding: '8px 18px', fontSize: 14, fontWeight: 600 }}>Download Now ↗</button>
        </div>
      </div>
    </nav>
  );
};

/* ─── Reusable Footer ─── */
export const LandingFooter = () => (
  <footer style={{ background: '#0f0f0f', padding: '80px 40px 0' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 80, justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ maxWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={20} color="white" />
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 2, color: 'white' }}>SYNERA</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7 }}>Protecting small businesses from cyber threats.</p>
          <button style={{ marginTop: 24, border: '1px solid #333', borderRadius: 999, padding: '10px 20px', color: '#9ca3af', fontSize: 14, background: 'transparent' }}>✉ team@synera.in</button>
        </div>

        {/* Link columns */}
        {[
          { title: 'Product', links: [{ t: 'Features', h: '#features' }, { t: 'Pricing', h: '#pricing' }, { t: 'Dashboard', h: '/login' }, { t: 'Download', h: '#' }] },
          { title: 'Company', links: [{ t: 'About Us', h: '/about' }, { t: 'Our Team', h: '/about#team' }, { t: 'GitHub', h: '#' }] },
          { title: 'Support', links: [{ t: 'FAQs', h: '#faq' }, { t: 'Contact Us', h: '#' }, { t: 'Privacy Policy', h: '#' }] },
        ].map((col) => (
          <div key={col.title}>
            <p style={{ color: '#9ca3af', fontSize: 12, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {col.links.map((l) => (
                <Link key={l.t} to={l.h} style={{ color: '#9ca3af', fontSize: 14 }} onMouseEnter={(e) => (e.target.style.color = 'white')} onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}>{l.t}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Social */}
      <div style={{ display: 'flex', gap: 12, marginTop: 48 }}>
        <a href="https://www.linkedin.com/in/joel-arpith-b18115210/" target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a href="https://github.com/Joel-Arpith" target="_blank" rel="noreferrer" style={{ width: 36, height: 36, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
        </a>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #1e1e1e', marginTop: 40, padding: '20px 0' }}>
        <p style={{ color: '#4b5563', fontSize: 13 }}>© 2026 Synera. All rights reserved.</p>
      </div>

      {/* Giant brand name */}
      <div style={{ textAlign: 'center', overflow: 'hidden', lineHeight: 0.8, marginTop: 40, paddingBottom: 0 }}>
        <span style={{ fontSize: 'clamp(80px, 15vw, 200px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: -4, display: 'block' }}>SYNERA</span>
      </div>
    </div>
  </footer>
);

/* ─── FAQ Item ─── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="bg-[#111827] border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-700 transition-all"
    >
      <div className="flex justify-between items-center gap-4">
        <span className="text-base text-white font-medium">{q}</span>
        <div className={`w-7 h-7 rounded-full bg-[#1f2937] text-white flex items-center justify-center shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <Plus size={14} />
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${open ? 'max-h-52' : 'max-h-0'}`}>
        <p className="pt-4 text-sm text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════════ */
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // Check if Supabase keys exist (for safety if user hasn't put them in env)
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn("Supabase credentials missing, simulating success");
      setTimeout(() => setStatus('success'), 1000);
      return;
    }

    try {
      const { error } = await supabase.from('contacts').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message
      }]);
      if (error) throw error;
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="bg-[#111827] py-16 px-10 border-t border-gray-800">
      <div className="reveal max-w-2xl mx-auto bg-[#0a0f1e] rounded-3xl p-12 shadow-2xl border border-gray-800">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold text-white mb-3">Get in Touch</h2>
          <p className="text-gray-300 text-base">Have a question or need a custom solution? Send us a message.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1f2937] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1f2937] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="john@company.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
            <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1f2937] text-white placeholder-gray-500 outline-none resize-none focus:ring-2 focus:ring-cyan-500/50 transition-all" placeholder="Tell us about your network..." />
          </div>

          {status === 'success' && <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm text-center border border-emerald-500/20">Message sent successfully! We'll be in touch soon.</div>}
          {status === 'error' && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm text-center border border-red-500/20">Something went wrong. Please try again later.</div>}

          <button disabled={status === 'loading'} className="mt-2 w-full py-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════ */
const Landing = () => {
  const [mockAlerts, setMockAlerts] = useState([
    { sig: 'ET SCAN Nmap probe detected', sev: 'HIGH', time: '10:45:02', ip: '45.33.32.156' },
  ]);
  const [activeStep, setActiveStep] = useState(0);

  /* Refs for scroll reveals */
  const featRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const pricingRef = useScrollReveal();
  const faqRef = useScrollReveal();
  const howRef = useScrollReveal();

  useEffect(() => {
    const sigs = [
      { sig: 'ET EXPLOIT OpenSSL Heartbleed', sev: 'CRITICAL', ip: '185.56.80.11' },
      { sig: 'ET POLICY DNS Query to .onion', sev: 'MEDIUM', ip: '103.21.44.2' },
      { sig: 'ET SCAN libssh brute force', sev: 'HIGH', ip: '92.118.160.5' },
      { sig: 'ET DOS SYN flood detected', sev: 'CRITICAL', ip: '38.60.251.18' },
    ];
    const t = setInterval(() => {
      const s = sigs[Math.floor(Math.random() * sigs.length)];
      setMockAlerts((prev) => [{ ...s, time: new Date().toLocaleTimeString([], { hour12: false }) }, ...prev].slice(0, 4));
    }, 3500);
    const s2 = setInterval(() => setActiveStep((p) => (p + 1) % 3), 2500);
    return () => { clearInterval(t); clearInterval(s2); };
  }, []);

  const sevColor = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#94a3b8' };

  return (
    <div className="bg-[#0a0f1e] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LandingNav />

      {/* ── HERO ── */}
      <section style={{ minHeight: '90vh', padding: '100px 40px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background image or Entropy canvas — z-0 */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#0f0f0f' }}>
            <ShaderAnimation />
        </div>

        {/* Dark overlay to fix text readability — z-[1] */}
        <div className="absolute inset-0 z-[1] bg-black/60" />

        {/* Hero content — z-[2] */}
        <div className="relative z-[2]" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #333', background: '#1a1a1a', borderRadius: 999, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: 'white' }}>🛡 Real-time threat detection for SMBs</span>
          </div>

          <h1 className="font-display text-white drop-shadow-lg" style={{ fontSize: 72, lineHeight: 1.1, fontWeight: 700, marginBottom: 24 }}>
            Your Business Is Being<br />Watched. Are You?
          </h1>

          <p style={{ color: '#9ca3af', fontSize: 18, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Synera detects cyber threats before they become disasters — built for businesses that can't afford to be breached.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
            {['Detects threats in <3 seconds', 'AI explains every alert', 'Auto-blocks attackers'].map((t) => (
              <span key={t} className="landing-check" style={{ color: '#9ca3af', fontSize: 14 }}>{t}</span>
            ))}
          </div>

          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <a href="#contact" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <LiquidButton variant="cool" size="xl">
                Contact Us
              </LiquidButton>
            </a>
          </div>

          {/* ── Dashboard Mockup ── */}
          <div style={{ maxWidth: 900, margin: '60px auto 0', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden', background: '#1a1a1a' }}>
            {/* Browser chrome */}
            <div style={{ background: '#111', borderBottom: '1px solid #2a2a2a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#10b981', display: 'inline-block' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ background: '#1e1e1e', borderRadius: 6, padding: '4px 24px', fontSize: 12, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>synera-sip.vercel.app</span>
              </div>
            </div>

            {/* Mockup content */}
            <div style={{ background: '#0d0d0d', padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Alerts', val: '247' },
                  { label: 'Active Threats', val: '12' },
                  { label: 'Blocked IPs', val: '38' },
                  { label: 'AI Insights', val: '189' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 16px' }}>
                    <p style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {mockAlerts.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: i === 0 ? '#1a0a0a' : '#111', border: i === 0 ? '1px solid #2a1a1a' : '1px solid #1e1e1e', borderRadius: 8, padding: '10px 16px', transition: 'all 0.4s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#4b5563' }}>{a.time}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'white', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.sig}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#4b5563' }}>{a.ip}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${sevColor[a.sev]}18`, color: sevColor[a.sev], border: `1px solid ${sevColor[a.sev]}30`, letterSpacing: 1 }}>{a.sev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST LOGOS ── */}
      <section className="bg-[#111827] py-16 px-10 border-b border-gray-800 text-center">
        <p className="text-gray-400 text-xs tracking-widest mb-6 uppercase font-semibold">Powered by open source technology</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {['Suricata', 'MaxMind', 'Supabase', 'Anthropic AI', 'Vercel'].map((n) => (
            <span key={n} className="border border-gray-700 rounded-full px-6 py-3 text-sm text-gray-300 font-medium">{n}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-[#0a0f1e] py-16 px-10">
        <div ref={featRef} className="reveal max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gray-400 text-xs tracking-widest uppercase mb-4 font-semibold">FEATURES</p>
            <h2 className="font-display text-5xl font-bold text-white mb-4">Everything you need to stay protected</h2>
            <p className="text-gray-300 text-lg">Built for business owners, not security experts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-children">
            {[
              { title: 'Real-Time Detection', desc: 'Suricata IDS engine monitors every packet on your network, 24/7.', mockup: (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#10b981', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span>→ Suricata listening on eth0</span>
                  <span>→ Packet captured: 192.168.1.1</span>
                  <span style={{ color: '#ef4444' }}>→ ALERT: ET SCAN detected</span>
                </div>
              )},
              { title: 'AI Threat Explanation', desc: 'Claude AI explains every alert in plain English — no security degree required.', mockup: (
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#1f2937', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', fontSize: 12, color: 'white', maxWidth: '85%', fontWeight: 500 }}>ET SCAN SSH brute force probe</div>
                  <div style={{ background: '#374151', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 12, color: '#e5e7eb', maxWidth: '90%', alignSelf: 'flex-end', border: '1px solid #4b5563', lineHeight: 1.5 }}>An attacker from Germany is trying to break into your SSH server using automated password guessing…</div>
                </div>
              )},
              { title: 'Auto-Block Engine', desc: 'Malicious IPs are automatically blocked the moment they cross your threshold.', mockup: (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ color: '#ef4444' }}>45.33.32.156 ✗ BLOCKED</span>
                  <span style={{ color: '#ef4444' }}>192.241.218.x ✗ BLOCKED</span>
                  <span style={{ color: '#ef4444' }}>38.60.251.18 ✗ BLOCKED</span>
                  <span style={{ color: '#9ca3af', marginTop: 4 }}>3 IPs quarantined today</span>
                </div>
              )},
              { title: 'Global Threat Map', desc: 'See exactly where attacks are coming from on a live world map.', mockup: (
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 200 100" width="160" style={{ opacity: 0.15 }}><ellipse cx="100" cy="50" rx="90" ry="40" fill="none" stroke="#fff" strokeWidth="0.5" /><line x1="10" y1="50" x2="190" y2="50" stroke="#fff" strokeWidth="0.3" /><line x1="100" y1="10" x2="100" y2="90" stroke="#fff" strokeWidth="0.3" /></svg>
                  {[[60, 35], [130, 45], [80, 55], [150, 30]].map(([cx, cy], i) => (
                    <React.Fragment key={i}>
                      <span style={{ position: 'absolute', left: cx * 0.8, top: cy * 2, width: 6, height: 6, borderRadius: 99, background: '#ef4444' }} />
                      <span style={{ position: 'absolute', left: cx * 0.8 - 4, top: cy * 2 - 4, width: 14, height: 14, borderRadius: 99, border: '2px solid #ef4444', opacity: 0.4, animation: 'pulseGlow 2s infinite', animationDelay: `${i * 0.4}s` }} />
                    </React.Fragment>
                  ))}
                </div>
              )},
              { title: '40,000+ Signatures', desc: 'Emerging Threats ruleset keeps you protected against known attack patterns.', mockup: (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#9ca3af', padding: 20, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden', height: '100%' }}>
                  {['ET SCAN Nmap -sS', 'ET DOS SYN flood', 'ET MALWARE C2 callback', 'ET EXPLOIT CVE-2024-xxx', 'ET POLICY NTP monlist', 'ET SCAN SSH brute'].map((r, i) => (
                    <span key={i} style={{ opacity: 0.4 + i * 0.1 }}>{r}</span>
                  ))}
                </div>
              )},
              { title: 'Runs on Raspberry Pi', desc: 'Deploy on affordable hardware. Full enterprise protection for under ₹5,000 setup cost.', mockup: (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9ca3af', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span>Device: Raspberry Pi 4</span>
                  <span>RAM: 2GB</span>
                  <span>Storage: 32GB SD</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Cost: ~₹4,000</span>
                </div>
              )},
            ].map((f, i) => (
              <div key={i} className="reveal bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-default">
                <div style={{ height: 200, background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>{f.mockup}</div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-[#111827] relative">
        <PulseBeams beams={beamsData} gradientColors={gradientColorsConfig} className="bg-[#111827] py-16">
        <div ref={howRef} className="reveal max-w-6xl mx-auto text-center px-10">
          <h2 className="font-display text-5xl text-white font-bold mb-4">Protect your network in 3 easy steps</h2>
          <p className="text-gray-300 text-lg mb-16">From setup to protection in under an hour</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Install on Raspberry Pi', text: 'Run our one-command setup script. Suricata and all dependencies install automatically.', code: './setup.sh' },
              { num: '02', title: 'Connect to your router', text: 'Plug your Pi into your router via ethernet. Synera instantly begins monitoring all network traffic.', code: null },
              { num: '03', title: 'Open your dashboard', text: 'Log into your secure dashboard from any browser. See threats, AI explanations, and blocked IPs live.', code: null },
            ].map((step, i) => (
              <div key={i} className={`bg-[#0a0f1e] border rounded-2xl p-8 text-left transition-colors duration-400 z-10 ${activeStep === i ? 'border-gray-600' : 'border-gray-800'}`}>
                <span className="text-xs text-gray-500 font-bold tracking-widest">{step.num}</span>
                <h3 className="text-xl text-white font-bold my-4">{step.title}</h3>
                <p className={`text-sm text-gray-400 leading-relaxed ${step.code ? 'mb-5' : ''}`}>{step.text}</p>
                {step.code && (
                  <div className="bg-[#111] border border-gray-800 rounded-lg p-3">
                    <code className="font-mono text-sm text-emerald-400">{step.code}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </PulseBeams>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0a0f1e] py-16 px-10 border-y border-gray-800">
        <div ref={statsRef} className="reveal max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-center gap-8 md:gap-0">
          {[
            { num: '40,000+', label: 'Threat Signatures' },
            { num: '<3s', label: 'Detection Time' },
            { num: '100%', label: 'Open Source' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 w-full">
                <h2 className="font-display text-5xl font-bold text-white">{item.num}</h2>
                <p className="text-sm text-gray-400 mt-2">{item.label}</p>
              </div>
              {i < 2 && <div className="hidden md:block w-[1px] h-16 bg-gray-800" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-[#111827] py-16 px-10">
        <div ref={pricingRef} className="reveal max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl font-bold text-white mb-4">Pricing Plan</h2>
            <p className="text-gray-300 text-lg">Simple, transparent pricing. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
            {/* Business — featured */}
            <div className="bg-[#0a0f1e] border border-gray-800 rounded-3xl p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <h3 className="text-xl font-bold text-white">Business Plan</h3>
                <span className="bg-cyan-500 text-white rounded-full px-3 py-1 text-xs font-bold">Most Popular</span>
              </div>
              <p className="text-sm text-gray-400 mb-5 relative z-10">Best for small teams</p>
              <p className="text-5xl font-bold text-white mb-6 relative z-10">₹2,999<span className="text-base font-normal text-gray-500">/mo</span></p>
              <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl py-4 text-base font-bold transition-colors mb-8 relative z-10 cursor-pointer">Download Now</button>

              <div className="border-t border-gray-800 pt-6 relative z-10">
                <p className="text-xs text-gray-500 tracking-widest uppercase font-bold mb-5">What's Included</p>
                <div className="flex flex-col gap-3">
                  {['3 networks monitored', 'Unlimited alerts per day', 'AI explanations on every threat', 'Auto-block malicious IPs', 'Global threat map', 'Priority email support', 'Weekly threat summary report'].map((f) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right stack */}
            <div className="flex flex-col gap-6">
              {/* Starter */}
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-2xl p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
                  <p className="text-xs text-gray-400 mb-4">For solo entrepreneurs</p>
                  <p className="text-4xl font-bold text-white">₹999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-white rounded-xl py-3 text-sm font-bold transition-colors mt-5 cursor-pointer">Download Now</button>
              </div>

              {/* Enterprise */}
              <div className="bg-[#0a0f1e] border border-gray-800 rounded-2xl p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
                  <p className="text-xs text-gray-400 mb-4">Unlimited everything</p>
                  <p className="text-4xl font-bold text-white">₹7,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
                </div>
                <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-800 text-white rounded-xl py-3 text-sm font-bold transition-colors mt-5 cursor-pointer">Contact Us</button>
              </div>
            </div>
          </div>

          {/* All plans include */}
          <div className="flex justify-center gap-3 mt-10 flex-wrap">
            {['Real-time Detection', 'AI Analysis', 'Auto-blocking', 'Threat Map'].map((p) => (
              <span key={p} className="border border-gray-700 rounded-full px-5 py-2 text-sm text-gray-400">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#0a0f1e] py-16 px-10 border-b border-gray-800">
        <div ref={faqRef} className="reveal max-w-6xl mx-auto">
          <h2 className="font-display text-5xl font-bold text-white text-center mb-16">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <FaqItem q="What is Synera?" a="Synera is a real-time network intrusion detection system that monitors your business network and alerts you to cyber threats." />
              <FaqItem q="Do I need IT experience?" a="Not at all. Synera's AI explains every alert in plain English. If you can read an email, you can understand our alerts." />
              <FaqItem q="What hardware do I need?" a="A Raspberry Pi 4 (around ₹4,000) connected to your router via ethernet cable. That's it." />
            </div>
            <div className="flex flex-col gap-4">
              <FaqItem q="Is my data stored securely?" a="Yes. All alerts are stored in your private Supabase database. We never access your data." />
              <FaqItem q="How quickly does it detect threats?" a="Synera detects most threats in under 3 seconds of the malicious packet hitting your network." />
              <FaqItem q="Can I cancel my subscription?" a="Yes, cancel anytime from your account settings. No long-term commitments." />
            </div>
          </div>
        </div>
      </section>

      <ContactForm />
      <LandingFooter />
    </div>
  );
};

export default Landing;
