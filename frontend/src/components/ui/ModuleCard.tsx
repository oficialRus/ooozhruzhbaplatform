import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  ClipboardList,
  Flame,
  Package,
  BoxSelect,
  Truck,
  Wallet,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import type { ModuleInfo } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardList,
  Flame,
  Package,
  BoxSelect,
  Truck,
  Wallet,
  AlertTriangle,
  BarChart3,
};

interface ModuleCardProps {
  module: ModuleInfo;
  stats?: { label: string; value: string | number }[];
}

export default function ModuleCard({ module, stats }: ModuleCardProps) {
  const navigate = useNavigate();
  const Icon = ICON_MAP[module.icon] || Package;

  return (
    <button
      onClick={() => navigate(module.path)}
      className="bg-surface rounded-xl border border-border p-5 text-left hover:shadow-lg hover:border-primary-200 transition-all duration-200 group cursor-pointer w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${module.color}15`, color: module.color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-1">
        {module.title}
      </h3>
      <p className="text-sm text-text-muted mb-4 line-clamp-2">
        {module.description}
      </p>

      {stats && stats.length > 0 && (
        <div className="flex gap-4 pt-3 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
