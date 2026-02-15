import { Circle, CheckCircle2, Clock } from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'done';

interface TaskItemProps {
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const STATUS_CONFIG: Record<TaskStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Circle, label: 'Ожидает', color: '#94a3b8' },
  in_progress: { icon: Clock, label: 'В работе', color: '#f59e0b' },
  done: { icon: CheckCircle2, label: 'Готово', color: '#22c55e' },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Низкий', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Средний', className: 'bg-warning-100 text-warning-600' },
  high: { label: 'Высокий', className: 'bg-danger-100 text-danger-600' },
};

export default function TaskItem({ title, assignee, status, priority, dueDate }: TaskItemProps) {
  const statusCfg = STATUS_CONFIG[status];
  const priorityCfg = PRIORITY_CONFIG[priority];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex items-center gap-3 py-3 group">
      <StatusIcon
        className="w-5 h-5 shrink-0"
        style={{ color: statusCfg.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{title}</p>
        <p className="text-xs text-text-muted">{assignee}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${priorityCfg.className}`}>
          {priorityCfg.label}
        </span>
        {dueDate && (
          <span className="text-xs text-text-muted">{dueDate}</span>
        )}
      </div>
    </div>
  );
}
