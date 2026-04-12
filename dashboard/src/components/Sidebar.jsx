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
  const sessionUser = "joelarpith2007@gmail.com"; 

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
      className={`fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-[#d2d2d7]/30 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#d2d2d7]/20">
        <div className="flex items-center gap-3">
          <Shield className="text-black shrink-0" size={22} />
          {!isCollapsed && (
            <span className="font-bold text-black text-[17px] tracking-tight">Synera</span>
          )}
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 py-8 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-black text-white shadow-lg' 
                : 'text-[#86868b] hover:bg-[#f5f5f7] hover:text-black'}
            `}
          >
            <item.icon size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-[14px] font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Identity & Control */}
      <div className="p-4 border-t border-[#d2d2d7]/20 space-y-3">
        {!isCollapsed && (
          <div className="px-3 py-2 bg-[#f5f5f7] rounded-xl mb-2">
            <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wide">Operator</p>
            <p className="text-[13px] text-black font-medium truncate">{sessionUser}</p>
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-xl transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-[14px] font-medium">End Session</span>}
        </button>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-[#86868b] hover:text-black transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
