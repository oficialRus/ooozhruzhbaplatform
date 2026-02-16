import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Flame,
  Package,
  BoxSelect,
  Truck,
  Wallet,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MODULES } from '@/config/modules';
import type { ModuleKey } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ClipboardList,
  Flame,
  Package,
  BoxSelect,
  Truck,
  Wallet,
  AlertTriangle,
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const allowedModules = MODULES.filter((m) =>
    user.allowedModules.includes(m.key as ModuleKey)
  );

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40 flex flex-col
        bg-sidebar-bg text-sidebar-text
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${className}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <img
          src="/logo.png"
          alt="ООО Дружба"
          className="h-9 w-auto max-w-[140px] min-w-0 object-contain"
        />
        {!collapsed && (
          <span className="text-white font-semibold text-base truncate">
            ООО Дружба
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Dashboard link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-150 group
            ${isActive
              ? 'bg-sidebar-active text-sidebar-text-active'
              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Главная</span>}
        </NavLink>

        {/* Divider */}
        <div className="h-px bg-white/10 my-3 mx-2" />

        {/* Module links */}
        {allowedModules.map((mod) => {
          const Icon = ICON_MAP[mod.icon] || Package;
          return (
            <NavLink
              key={mod.key}
              to={mod.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors duration-150 group
                ${isActive
                  ? 'bg-sidebar-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{mod.title}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">
                {user.fullName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-[11px] text-sidebar-text truncate">{user.position}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors mt-1"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Выйти</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-bg border-2 border-border flex items-center justify-center text-sidebar-text hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
