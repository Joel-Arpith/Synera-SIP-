import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, Plus, X } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { Entropy } from '../components/Entropy';

/* ─── Particle Canvas ─── */
const ParticleHero = () => {
    // ... existing ParticleHero code ...
    // Note: I'm keeping ParticleHero as it's specifically for the hero section, 
    // while Entropy will be full-page.
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

/* ─── Reusable Navbar (Simplified for brevity in diff) ─── */
// ... (Keeping existing LandingNav, LandingFooter, FaqItem)

export const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: scrolled ? '8px 20px' : '16px 20px', background: scrolled ? 'rgba(255,255,255,0.8)' : 'transparent', backdropFilter: scrolled ? 'blur(10px)' : 'none', borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: 999, padding: '10px 20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={16} color="#0a0a0a" />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 2, color: '#0a0a0a' }}>SYNERA</span>
        </Link>

        <div style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
          <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>How It Works</a>
          <a href="#pricing" style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>Pricing</a>
          <Link to="/about" style={{ fontSize: 13, fontWeight: 500, color: '#4b5563' }}>About</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" style={{ fontSize: 13, color: '#0a0a0a', fontWeight: 600 }}>Sign In</Link>
          <button style={{ background: '#0a0a0a', color: 'white', borderRadius: 999, padding: '8px 18px', fontSize: 13, fontWeight: 600 }}>Download Now</button>
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
        <div style={{ width: 36, height: 36, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </div>
        <div style={{ width: 36, height: 36, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
        </div>
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
      style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 15, color: '#0a0a0a', fontWeight: 500 }}>{q}</span>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: '#0a0a0a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <Plus size={14} />
        </div>
      </div>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <p style={{ paddingTop: 12, fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{a}</p>
      </div>
    </div>
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
    <div className="relative min-h-screen" style={{ fontFamily: "'Inter', sans-serif", color: '#ffffff', backgroundColor: '#0a0f1e' }}>
      {/* Entropy background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none" style={{ opacity: 0.55 }}>
        <Entropy size={Math.max(window.innerWidth, window.innerHeight)} className="w-full h-full" />
      </div>

      {/* All existing Landing content */}
      <div className="relative z-10">
        <LandingNav />

        {/* ── HERO ── */}
        <section style={{ background: 'transparent', minHeight: '90vh', padding: '100px 40px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ParticleHero />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #333', background: '#1a1a1a', borderRadius: 999, padding: '6px 16px', marginBottom: 32 }}>
              <span style={{ fontSize: 13, color: 'white' }}>🛡 Real-time threat detection for SMBs</span>
            </div>

            <h1 className="font-display" style={{ fontSize: 72, color: 'white', lineHeight: 1.1, fontWeight: 700, marginBottom: 24 }}>
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

            <button style={{ background: 'white', color: '#0a0a0a', borderRadius: 999, padding: '14px 32px', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Download Now ↗
            </button>

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
                    <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a1a1a', borderRadius: 10, padding: '14px 16px' }}>
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
        <section style={{ background: 'white', padding: '48px 40px', borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: 12, letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase', fontWeight: 600 }}>Powered by open source technology</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['Suricata', 'MaxMind', 'Supabase', 'Anthropic AI', 'Vercel'].map((n) => (
              <span key={n} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '12px 24px', fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{n}</span>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ background: 'transparent', padding: '120px 40px' }}>
          <div ref={featRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#6b7280', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>FEATURES</p>
              <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700, color: '#0a0a0a', marginBottom: 16 }}>Everything you need to stay protected</h2>
              <p style={{ color: '#6b7280', fontSize: 18 }}>Built for business owners, not security experts.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }} className="reveal-children">
              {[
                { title: 'Real-Time Detection', desc: 'Suricata IDS engine monitors every packet on your network, 24/7.', bg: '#f0fdf4', mockup: (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#16a34a', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span>→ Suricata listening on eth0</span>
                    <span>→ Packet captured: 192.168.1.1</span>
                    <span style={{ color: '#ef4444' }}>→ ALERT: ET SCAN detected</span>
                  </div>
                )},
                { title: 'AI Threat Explanation', desc: 'Claude AI explains every alert in plain English — no security degree required.', bg: '#faf5ff', mockup: (
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: '#1e1e2e', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', fontSize: 12, color: 'white', maxWidth: '85%', fontWeight: 500 }}>ET SCAN SSH brute force probe</div>
                    <div style={{ background: 'white', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 12, color: '#374151', maxWidth: '90%', alignSelf: 'flex-end', border: '1px solid #e5e7eb', lineHeight: 1.5 }}>An attacker from Germany is trying to break into your SSH server using automated password guessing…</div>
                  </div>
                )},
                { title: 'Auto-Block Engine', desc: 'Malicious IPs are automatically blocked the moment they cross your threshold.', bg: '#fff1f2', mockup: (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ color: '#ef4444' }}>45.33.32.156 ✗ BLOCKED</span>
                    <span style={{ color: '#ef4444' }}>192.241.218.x ✗ BLOCKED</span>
                    <span style={{ color: '#ef4444' }}>38.60.251.18 ✗ BLOCKED</span>
                    <span style={{ color: '#9ca3af', marginTop: 4 }}>3 IPs quarantined today</span>
                  </div>
                )},
                { title: 'Global Threat Map', desc: 'See exactly where attacks are coming from on a live world map.', bg: '#eff6ff', mockup: (
                  <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 200 100" width="160" style={{ opacity: 0.15 }}><ellipse cx="100" cy="50" rx="90" ry="40" fill="none" stroke="#0a0a0a" strokeWidth="0.5" /><line x1="10" y1="50" x2="190" y2="50" stroke="#0a0a0a" strokeWidth="0.3" /><line x1="100" y1="10" x2="100" y2="90" stroke="#0a0a0a" strokeWidth="0.3" /></svg>
                    {[[60, 35], [130, 45], [80, 55], [150, 30]].map(([cx, cy], i) => (
                      <React.Fragment key={i}>
                        <span style={{ position: 'absolute', left: cx * 0.8, top: cy * 2, width: 6, height: 6, borderRadius: 99, background: '#ef4444' }} />
                        <span style={{ position: 'absolute', left: cx * 0.8 - 4, top: cy * 2 - 4, width: 14, height: 14, borderRadius: 99, border: '2px solid #ef4444', opacity: 0.4, animation: 'pulseGlow 2s infinite', animationDelay: `${i * 0.4}s` }} />
                      </React.Fragment>
                    ))}
                  </div>
                )},
                { title: '40,000+ Signatures', desc: 'Emerging Threats ruleset keeps you protected against known attack patterns.', bg: '#f0fdf4', mockup: (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#374151', padding: 20, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden', height: '100%' }}>
                    {['ET SCAN Nmap -sS', 'ET DOS SYN flood', 'ET MALWARE C2 callback', 'ET EXPLOIT CVE-2024-xxx', 'ET POLICY NTP monlist', 'ET SCAN SSH brute'].map((r, i) => (
                      <span key={i} style={{ opacity: 0.4 + i * 0.1 }}>{r}</span>
                    ))}
                  </div>
                )},
                { title: 'Runs on Raspberry Pi', desc: 'Deploy on affordable hardware. Full enterprise protection for under ₹5,000 setup cost.', bg: '#fefce8', mockup: (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#374151', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span>Device: Raspberry Pi 4</span>
                    <span>RAM: 2GB</span>
                    <span>Storage: 32GB SD</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Cost: ~₹4,000</span>
                  </div>
                )},
              ].map((f, i) => (
                <div key={i} className="reveal" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ height: 200, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>{f.mockup}</div>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0a', marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ background: 'transparent', padding: '120px 40px' }}>
          <div ref={howRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <h2 className="font-display" style={{ fontSize: 56, color: 'white', fontWeight: 700, marginBottom: 16 }}>Protect your network in 3 easy steps</h2>
            <p style={{ color: '#9ca3af', fontSize: 18, marginBottom: 80 }}>From setup to protection in under an hour</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                { num: '01', title: 'Install on Raspberry Pi', text: 'Run our one-command setup script. Suricata and all dependencies install automatically.', code: './setup.sh' },
                { num: '02', title: 'Connect to your router', text: 'Plug your Pi into your router via ethernet. Synera instantly begins monitoring all network traffic.', code: null },
                { num: '03', title: 'Open your dashboard', text: 'Log into your secure dashboard from any browser. See threats, AI explanations, and blocked IPs live.', code: null },
              ].map((step, i) => (
                <div key={i} style={{ background: '#1a1a1a', border: `1px solid ${activeStep === i ? '#444' : '#2a2a2a'}`, borderRadius: 16, padding: 32, textAlign: 'left', transition: 'border-color 0.4s' }}>
                  <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 700, letterSpacing: 2 }}>{step.num}</span>
                  <h3 style={{ fontSize: 20, color: 'white', fontWeight: 700, margin: '16px 0 12px' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: step.code ? 20 : 0 }}>{step.text}</p>
                  {step.code && (
                    <div style={{ background: '#111', border: '1px solid #333', borderRadius: 8, padding: 12 }}>
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#10b981' }}>{step.code}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ background: 'white', padding: '80px 40px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
          <div ref={statsRef} className="reveal" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', alignItems: 'center', textAlign: 'center', gap: 0 }}>
            {[
              { num: '40,000+', label: 'Threat Signatures' },
              null,
              { num: '<3s', label: 'Detection Time' },
              null,
              { num: '100%', label: 'Open Source' },
            ].map((item, i) =>
              item === null ? (
                <div key={i} style={{ width: 1, height: 60, background: '#e5e7eb', margin: '0 auto' }} />
              ) : (
                <div key={i}>
                  <h2 className="font-display" style={{ fontSize: 56, fontWeight: 700, color: '#0a0a0a' }}>{item.num}</h2>
                  <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{item.label}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ background: 'white', padding: '120px 40px' }}>
          <div ref={pricingRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 className="font-display" style={{ fontSize: 56, fontWeight: 700, color: '#0a0a0a', marginBottom: 16 }}>Pricing Plan</h2>
              <p style={{ color: '#6b7280', fontSize: 18 }}>Simple, transparent pricing. Cancel anytime.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'stretch' }}>
              {/* Business — featured */}
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 40, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a' }}>Business Plan</h3>
                  <span style={{ background: '#0a0a0a', color: 'white', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Most Popular</span>
                </div>
                <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Best for small teams</p>
                <p style={{ fontSize: 48, fontWeight: 700, color: '#0a0a0a', marginBottom: 24 }}>₹2,999<span style={{ fontSize: 16, fontWeight: 400, color: '#6b7280' }}>/mo</span></p>
                <button style={{ width: '100%', background: '#0a0a0a', color: 'white', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 32 }}>Download Now</button>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
                  <p style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>What's Included</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {['3 networks monitored', 'Unlimited alerts per day', 'AI explanations on every threat', 'Auto-block malicious IPs', 'Global threat map', 'Priority email support', 'Weekly threat summary report'].map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#374151' }}>
                        <span style={{ width: 20, height: 20, borderRadius: 999, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Starter */}
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, padding: 28, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0a', marginBottom: 4 }}>Starter</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>For solo entrepreneurs</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: '#0a0a0a' }}>₹999<span style={{ fontSize: 14, fontWeight: 400, color: '#6b7280' }}>/mo</span></p>
                  </div>
                  <button style={{ width: '100%', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#0a0a0a', marginTop: 20 }}>Download Now</button>
                </div>

                {/* Enterprise */}
                <div style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>Enterprise</h3>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Unlimited everything</p>
                    <p style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>₹7,999<span style={{ fontSize: 14, fontWeight: 400, color: '#9ca3af' }}>/mo</span></p>
                  </div>
                  <button style={{ width: '100%', background: 'transparent', border: '1px solid #444', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white', marginTop: 20 }}>Contact Us</button>
                </div>
              </div>
            </div>

            {/* All plans include */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
              {['Real-time Detection', 'AI Analysis', 'Auto-blocking', 'Threat Map'].map((p) => (
                <span key={p} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '8px 18px', fontSize: 13, color: '#6b7280' }}>{p}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ background: 'white', padding: '120px 40px' }}>
          <div ref={faqRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 className="font-display" style={{ fontSize: 56, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', marginBottom: 64 }}>Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FaqItem q="What is Synera?" a="Synera is a real-time network intrusion detection system that monitors your business network and alerts you to cyber threats." />
                <FaqItem q="Do I need IT experience?" a="Not at all. Synera's AI explains every alert in plain English. If you can read an email, you can understand our alerts." />
                <FaqItem q="What hardware do I need?" a="A Raspberry Pi 4 (around ₹4,000) connected to your router via ethernet cable. That's it." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FaqItem q="Is my data stored securely?" a="Yes. All alerts are stored in your private Supabase database. We never access your data." />
                <FaqItem q="How quickly does it detect threats?" a="Synera detects most threats in under 3 seconds of the malicious packet hitting your network." />
                <FaqItem q="Can I cancel my subscription?" a="Yes, cancel anytime from your account settings. No long-term commitments." />
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
};

export default Landing;
