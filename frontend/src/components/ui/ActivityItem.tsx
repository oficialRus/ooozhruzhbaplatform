interface ActivityItemProps {
  user: string;
  action: string;
  target: string;
  time: string;
  avatarColor?: string;
}

export default function ActivityItem({
  user,
  action,
  target,
  time,
  avatarColor = '#3b82f6',
}: ActivityItemProps) {
  const initials = user
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">
          <span className="font-medium">{user}</span>{' '}
          <span className="text-text-secondary">{action}</span>{' '}
          <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-text-muted mt-0.5">{time}</p>
      </div>
    </div>
  );
}
