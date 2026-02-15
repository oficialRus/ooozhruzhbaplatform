import { Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Главная' }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Поиск..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-secondary border border-border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="ml-2 flex items-center gap-3 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
              {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-text-primary leading-tight">
                {user.fullName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-xs text-text-muted">{user.position}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
