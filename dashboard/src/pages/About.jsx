import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Sparkles, Code } from 'lucide-react';
import { LandingNav, LandingFooter } from './Landing';
import useScrollReveal from '../hooks/useScrollReveal';

const About = () => {
  const storyRef = useScrollReveal();
  const teamRef = useScrollReveal();
  const missionRef = useScrollReveal();
  const ctaRef = useScrollReveal();

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0a0a0a' }}>
      <LandingNav />

      {/* ── HERO ── */}
      <section style={{ background: '#0f0f0f', padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ color: '#9ca3af', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 32, fontWeight: 600 }}>THE TEAM</p>
          <h1 className="font-display" style={{ fontSize: 64, color: 'white', fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Built by students who got tired of reading about breaches.
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 18, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Synera was born out of a simple frustration: cybersecurity tools are either too expensive or too complex for the businesses that need them most.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ background: 'white', padding: '120px 40px' }}>
        <div ref={storyRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left — quote */}
          <div style={{ borderLeft: '4px solid #0a0a0a', paddingLeft: 32 }}>
            <p className="font-display" style={{ fontSize: 28, color: '#0a0a0a', lineHeight: 1.4, fontWeight: 400 }}>
              "Small businesses account for 43% of all cyber attacks, yet most can't afford enterprise security. We built Synera to change that."
            </p>
          </div>

          {/* Right — story */}
          <div style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 24 }}>
              What started as a college project became something we genuinely believe in. We spent months learning network security, building and breaking things, until we had something that actually worked.
            </p>
            <p style={{ marginBottom: 24 }}>
              Synera runs on a Raspberry Pi, costs less than a Netflix subscription, and gives your business the same protection Fortune 500 companies pay thousands for.
            </p>
            <p>
              We're four students from Hyderabad who think every business deserves to feel safe online.
            </p>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" style={{ background: '#f9fafb', padding: '120px 40px', borderTop: '1px solid #f0f0f0' }}>
        <div ref={teamRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: '#6b7280', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>OUR TEAM</p>
            <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700, color: '#0a0a0a' }}>The people behind Synera</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }} className="reveal-children">
            {[
              { name: 'Joel Arpith', role: 'LEAD DEVELOPER & ARCHITECT', desc: 'Built the core IDS pipeline, backend systems, and overall project architecture.', color: '#0f0f0f', initials: 'JA' },
              { name: 'Aditya Ummadi', role: 'SECURITY RESEARCH & RULES ENGINE', desc: 'Designed custom Suricata detection rules and led threat intelligence research.', color: '#1e3a5f', initials: 'AU' },
              { name: 'Abhiram Suraparaju', role: 'FRONTEND & DASHBOARD', desc: 'Crafted the SOC dashboard interface and real-time data visualizations.', color: '#14532d', initials: 'AS' },
              { name: 'Hansitha Purshotham', role: 'AI INTEGRATION & QA', desc: 'Integrated Claude AI explanation engine and led end-to-end testing.', color: '#3b0764', initials: 'HP' },
            ].map((m, i) => (
              <div key={i} className="reveal" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, padding: 40 }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                  {m.initials}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a', marginTop: 20 }}>{m.name}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', margin: '4px 0 12px', fontWeight: 500 }}>{m.role}</p>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ background: '#0f0f0f', padding: '120px 40px' }}>
        <div ref={missionRef} className="reveal" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 64 }}>What we stand for</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }} className="reveal-children">
            {[
              { emoji: '🔒', title: 'Security for Everyone', text: 'No business is too small to deserve protection from cyber threats.' },
              { emoji: '💡', title: 'Clarity Over Complexity', text: "If your security tool needs a manual, it's broken. We speak human, not jargon." },
              { emoji: '🔧', title: 'Built to Last', text: 'Open source core, runs on hardware you own. No vendor lock-in. Ever.' },
            ].map((v, i) => (
              <div key={i} className="reveal" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>{v.emoji}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#0f0f0f', padding: '80px 40px', borderTop: '1px solid #1e1e1e', textAlign: 'center' }}>
        <div ref={ctaRef} className="reveal">
          <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700, color: 'white', marginBottom: 32 }}>Ready to protect your business?</h2>
          <button style={{ background: 'white', color: '#0a0a0a', borderRadius: 999, padding: '16px 40px', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Download Now ↗
          </button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default About;
