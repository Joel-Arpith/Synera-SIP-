import React from 'react';
import { Shield, Sparkles, Code, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#f8fafc]">
      {/* Navbar Minimal */}
      <nav className="py-8 px-8 border-b border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link to="/" className="flex items-center gap-3">
              <Shield className="text-[#6366f1]" size={28} />
              <span className="text-xl font-bold tracking-tight">Synera</span>
           </Link>
           <Link to="/login" className="text-sm font-medium text-[#94a3b8] hover:text-white transition-colors">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto space-y-8">
           <span className="text-[11px] font-bold text-[#6366f1] tracking-[3px] uppercase">The Team</span>
           <h1 className="text-[48px] leading-[1.2] font-bold tracking-tight">
              Built by students who got tired of reading about breaches.
           </h1>
           <p className="text-xl text-[#94a3b8] leading-relaxed">
              Synera was born out of a simple frustration: cybersecurity tools are either too expensive or too complex for the businesses that need them most.
           </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-8 bg-[#111118]/50 border-y border-[#1e1e2e]">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
            <div className="space-y-6">
               <div className="h-1 w-20 bg-[#6366f1]" />
               <blockquote className="text-[32px] font-medium leading-[1.4] text-[#f8fafc]">
                  "Small businesses account for 43% of all cyber attacks, yet most can't afford enterprise security. We built Synera to change that."
               </blockquote>
            </div>
            
            <div className="space-y-8 text-[#94a3b8] leading-relaxed text-lg">
               <p>
                  What started as a college project became something we genuinely believe in. We spent months learning network security, building and breaking things, until we had something that actually worked.
               </p>
               <p>
                  Synera runs on a Raspberry Pi, costs less than a Netflix subscription, and gives your business the same protection Fortune 500 companies pay thousands for.
               </p>
            </div>
         </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-8">
         <div className="max-w-7xl mx-auto space-y-20">
            <h2 className="text-3xl font-bold text-center">The people behind Synera</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { 
                   name: 'Joel Arpith', role: 'Lead Developer & Architect', 
                   desc: 'Built the core IDS pipeline and backend systems', 
                   color: '#6366f1' 
                 },
                 { 
                   name: 'Aditya Ummadi', role: 'Security Research & Rules Engine', 
                   desc: 'Designed the custom Suricata detection rules', 
                   color: '#06b6d4' 
                 },
                 { 
                   name: 'Abhiram Suraparaju', role: 'Frontend & Dashboard', 
                   desc: 'Crafted the SOC dashboard and real-time UI', 
                   color: '#10b981' 
                 },
                 { 
                   name: 'Hansitha Purshotham', role: 'AI Integration & Testing', 
                   desc: 'Integrated Claude AI and led QA testing', 
                   color: '#8b5cf6' 
                 }
               ].map((m, i) => (
                 <div key={i} className="glass-card p-10 flex items-start gap-8 group hover:border-[#3a3a4a] transition-all duration-300">
                    <div className="h-20 w-20 rounded-[16px] flex items-center justify-center text-2xl font-bold text-white shrink-0 group-hover:scale-105 transition-transform shadow-lg" style={{ backgroundColor: m.color }}>
                       {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="space-y-4 pt-1">
                       <div>
                          <h3 className="text-xl font-bold">{m.name}</h3>
                          <p className="text-sm font-semibold text-[#6366f1]">{m.role}</p>
                       </div>
                       <p className="text-[#94a3b8] text-sm leading-relaxed">{m.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-8 border-t border-[#1e1e2e]">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Lock, title: 'Security for Everyone', text: 'No business is too small to deserve protection.' },
              { icon: Sparkles, title: 'Clarity Over Complexity', text: "If your security tool needs a manual, it's broken." },
              { icon: Code, title: 'Built to Last', text: 'Open source core, runs on hardware you own.' }
            ].map((v, i) => (
               <div key={i} className="space-y-6 text-center">
                  <div className="mx-auto h-16 w-16 bg-[#111118] border border-[#2a2a3a] rounded-2xl flex items-center justify-center text-[#6366f1] mb-8">
                     <v.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold">{v.title}</h3>
                  <p className="text-[#94a3b8] leading-relaxed">{v.text}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 px-8 border-t border-[#1e1e2e] text-center">
         <p className="text-[#475569] text-sm">© 2026 Synera Security Lab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
