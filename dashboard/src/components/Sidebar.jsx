import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  ShieldAlert, 
  History, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../supabase';

const Sidebar = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/map', icon: MapIcon, label: 'Threat Map' },
    { to: '/blocked', icon: ShieldAlert, label: 'Blocked IPs' },
    { to: '/alerts', icon: History, label: 'Alert Log' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-cyan-primary/20 p-2 rounded-lg border border-cyan-primary/30">
          <ShieldCheck className="text-cyan-primary h-6 w-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          CyberIDS
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
              ${isActive 
                ? 'bg-cyan-primary/10 text-cyan-primary border border-cyan-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110`} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-danger hover:bg-danger/10 transition-colors group"
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
