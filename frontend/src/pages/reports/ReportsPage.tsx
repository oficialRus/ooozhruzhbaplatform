import {
  ClipboardList,
  Package,
  Truck,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MODULES } from '@/config/modules';
import {
  StatCard,
  ModuleCard,
  ActivityItem,
  TaskItem,
  OrderIntakeChart,
} from '@/components/ui';

const MOCK_STATS = [
  {
    title: 'Заказов сегодня',
    value: 24,
    change: 12,
    icon: <ClipboardList className="w-5 h-5" />,
    color: '#3b82f6',
  },
  {
    title: 'На складе позиций',
    value: '1,247',
    change: -3,
    icon: <Package className="w-5 h-5" />,
    color: '#8b5cf6',
  },
  {
    title: 'Отгрузок в пути',
    value: 8,
    change: 25,
    icon: <Truck className="w-5 h-5" />,
    color: '#06b6d4',
  },
  {
    title: 'К оплате (₽)',
    value: '482,500',
    change: -8,
    icon: <Wallet className="w-5 h-5" />,
    color: '#ec4899',
  },
];

const MODULE_STATS: Record<string, { label: string; value: string | number }[]> = {
  orders: [
    { label: 'Новых', value: 12 },
    { label: 'В работе', value: 8 },
  ],
  production: [
    { label: 'Активных', value: 5 },
    { label: 'Завершено', value: 34 },
  ],
  materials: [
    { label: 'Позиций', value: '1,247' },
    { label: 'Мало на складе', value: 15 },
  ],
  packaging: [
    { label: 'В очереди', value: 7 },
    { label: 'Готово', value: 19 },
  ],
  shipping: [
    { label: 'К отгрузке', value: 6 },
    { label: 'В пути', value: 8 },
  ],
  payments: [
    { label: 'Оплачено', value: '₽1.2M' },
    { label: 'Долг', value: '₽482K' },
  ],
  claims: [
    { label: 'Открытых', value: 3 },
    { label: 'Решено', value: 28 },
  ],
  reports: [
    { label: 'Отчетов', value: 12 },
    { label: 'За период', value: 'неделя' },
  ],
};

const MOCK_ACTIVITIES = [
  {
    user: 'Петров А.С.',
    action: 'создал заказ',
    target: '№2456',
    time: '5 минут назад',
    avatarColor: '#3b82f6',
  },
  {
    user: 'Сидорова М.В.',
    action: 'завершила сваривание',
    target: 'партии #89',
    time: '12 минут назад',
    avatarColor: '#f59e0b',
  },
  {
    user: 'Козлов Д.А.',
    action: 'обновил остатки',
    target: 'Сталь 3мм',
    time: '25 минут назад',
    avatarColor: '#8b5cf6',
  },
  {
    user: 'Морозов А.Н.',
    action: 'оформил накладную',
    target: '№1187',
    time: '1 час назад',
    avatarColor: '#06b6d4',
  },
  {
    user: 'Волкова О.И.',
    action: 'подтвердила оплату',
    target: 'от ИП Смирнов',
    time: '2 часа назад',
    avatarColor: '#ec4899',
  },
];

const MOCK_TASKS = [
  {
    title: 'Обработать заказ №2456 — ООО «Рассвет»',
    assignee: 'Петров А.С.',
    status: 'in_progress' as const,
    priority: 'high' as const,
    dueDate: '15 фев',
  },
  {
    title: 'Провести инвентаризацию склада №2',
    assignee: 'Козлов Д.А.',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: '16 фев',
  },
  {
    title: 'Рекламация от ООО «ТехноПром» — брак',
    assignee: 'Лебедев А.В.',
    status: 'in_progress' as const,
    priority: 'high' as const,
    dueDate: '15 фев',
  },
  {
    title: 'Фасовка партии #92 — 500 единиц',
    assignee: 'Новикова Е.П.',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: '17 фев',
  },
  {
    title: 'Отгрузка в Москву — 3 паллеты',
    assignee: 'Морозов А.Н.',
    status: 'done' as const,
    priority: 'low' as const,
    dueDate: '14 фев',
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export default function ReportsPage() {
  const { user } = useAuth();

  if (!user) return null;

  const greeting = getGreeting();

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            {greeting}, {user.fullName.split(' ')[1]}!
          </h2>
          <p className="text-text-secondary mt-1">
            Вот что происходит сегодня в системе
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-accent-50 text-accent-600 px-3 py-1.5 rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Все системы работают
          </div>
          <div className="text-sm text-text-muted">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Все разделы
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MODULES.map((mod) => (
            <ModuleCard
              key={mod.key}
              module={mod}
              stats={MODULE_STATS[mod.key]}
            />
          ))}
        </div>
      </div>

      <OrderIntakeChart />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-text-secondary" />
              <h3 className="font-semibold text-text-primary">Последние действия</h3>
            </div>
            <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              Все
            </button>
          </div>
          <div className="divide-y divide-border">
            {MOCK_ACTIVITIES.map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-text-secondary" />
              <h3 className="font-semibold text-text-primary">Текущие задачи</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-warning-100 text-warning-600 px-2 py-0.5 rounded-full font-medium">
                3 срочных
              </span>
              <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Все задачи
              </button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {MOCK_TASKS.map((task, i) => (
              <TaskItem key={i} {...task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
