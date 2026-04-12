import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Activity, 
  Globe, 
  Ban, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../supabase';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const sessionUser = "joelarpith2007@gmail.com"; // In reality, get from context

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Alert Log', path: '/alerts' },
    { icon: Globe, label: 'Threat Map', path: '/map' },
    { icon: Ban, label: 'Blocked IPs', path: '/blocked' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#111118] border-r border-[#2a2a3a] transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}
    >
      {/* Logo */}
      <div className="h-[56px] flex items-center px-5 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-3">
          <Shield className="text-[#6366f1] shrink-0" size={24} />
          {!isCollapsed && <span className="font-bold text-[#f8fafc] text-lg tracking-tight">Synera</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 p-3 rounded-[8px] transition-smooth group
              ${isActive ? 'bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'text-[#94a3b8] hover:bg-[#1a1a24] hover:text-[#f8fafc]'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e1e2e] space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2">
            <p className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Active System</p>
            <p className="text-xs text-[#94a3b8] truncate">{sessionUser}</p>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-[#ef4444] hover:bg-[#ef444410] rounded-[8px] transition-smooth"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-[#475569] hover:text-[#f8fafc] mt-2"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
