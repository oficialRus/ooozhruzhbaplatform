import { Circle, CheckCircle2, Clock } from 'lucide-react';

type TaskStatus = 'pending' | 'in_progress' | 'done';

interface TaskItemProps {
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  canChangeStatus?: boolean;
  onToggleStatus?: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Circle, label: 'Не выполнено', color: '#94a3b8' },
  in_progress: { icon: Clock, label: 'В работе', color: '#f59e0b' },
  done: { icon: CheckCircle2, label: 'Выполнено', color: '#22c55e' },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Низкий', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Средний', className: 'bg-warning-100 text-warning-600' },
  high: { label: 'Высокий', className: 'bg-danger-100 text-danger-600' },
};

export default function TaskItem({
  title,
  assignee,
  status,
  priority,
  dueDate,
  canChangeStatus,
  onToggleStatus,
}: TaskItemProps) {
  const statusCfg = STATUS_CONFIG[status];
  const priorityCfg = PRIORITY_CONFIG[priority];
  const StatusIcon = statusCfg.icon;
  const isInteractive = Boolean(canChangeStatus && onToggleStatus);

  return (
    <div
      className={`flex items-center gap-3 py-3 group ${
        isInteractive ? 'cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2' : ''
      }`}
      onClick={isInteractive ? onToggleStatus : undefined}
    >
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
      <div className="flex items-center gap-2 shrink-0">
        <StatusIcon
          className="w-5 h-5"
          style={{ color: statusCfg.color }}
        />
        <span className="text-xs text-text-muted">{statusCfg.label}</span>
      </div>
    </div>
  );
}
