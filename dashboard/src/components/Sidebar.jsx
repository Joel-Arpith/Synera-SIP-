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

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
  { icon: Activity,        label: 'Alert Log',  path: '/alerts'    },
  { icon: Globe,           label: 'Threat Map', path: '/map'       },
  { icon: Ban,             label: 'Blocked IPs',path: '/blocked'   },
  { icon: Settings,        label: 'Settings',   path: '/settings'  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: collapsed ? 64 : 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col transition-[width] duration-200 ease-out"
    >
      {/* Brand */}
      <div
        className="h-14 flex items-center px-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <Shield size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        {!collapsed && (
          <span
            className="ml-3 font-semibold tracking-tight text-sm"
            style={{ color: 'var(--text-1)' }}
          >
            Synera
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-white'
                  : 'hover:text-[var(--text-1)]'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-2)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8 }} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-2 shrink-0 space-y-0.5"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--danger)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center p-2 rounded-[var(--radius-md)] transition-colors duration-150"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
