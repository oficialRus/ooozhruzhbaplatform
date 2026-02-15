import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'с прошлой недели',
  icon,
  color,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive
                ? 'text-accent-600 bg-accent-50'
                : 'text-danger-600 bg-danger-50'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}
            {change}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
      <p className="text-sm text-text-muted">
        {title}
        {change !== undefined && (
          <span className="ml-1 text-text-muted">· {changeLabel}</span>
        )}
      </p>
    </div>
  );
}
