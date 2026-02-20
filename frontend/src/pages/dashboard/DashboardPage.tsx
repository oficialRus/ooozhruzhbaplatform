import { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, Plus } from 'lucide-react';
import { TaskItem } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

type TaskPriority = 'low' | 'medium' | 'high';

interface DashboardTask {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  dueDate?: string;
}

const TASKS_STORAGE_KEY = 'dashboard_tasks';

function formatDate(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const canCreateTasks = user?.role === 'admin';

  if (!user) return null;

  useEffect(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed: DashboardTask[] = JSON.parse(saved);
      setTasks(parsed);
    } catch {
      localStorage.removeItem(TASKS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreateTasks) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const newTask: DashboardTask = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      assignee: assignee.trim() || 'Не назначен',
      priority,
      dueDate: formatDate(dueDate),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
    setAssignee('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Главная</h2>
          <p className="text-sm text-text-muted">Быстрый старт по системе</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {canCreateTasks && (
          <section className="xl:col-span-2 bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">Новая задача</h3>
            </div>

            <form className="space-y-3" onSubmit={handleCreateTask}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Название задачи"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-300"
              />

              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                type="text"
                placeholder="Ответственный"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-300"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-300"
                >
                  <option value="low">Низкий приоритет</option>
                  <option value="medium">Средний приоритет</option>
                  <option value="high">Высокий приоритет</option>
                </select>

                <input
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  type="date"
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-300"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 transition-colors"
              >
                Создать задачу
              </button>
            </form>
          </section>
        )}

        <section className={`${canCreateTasks ? 'xl:col-span-3' : 'xl:col-span-5'} bg-surface rounded-xl border border-border p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary">Список задач</h3>
            </div>
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
              {tasks.length} шт.
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-muted">
                {canCreateTasks
                  ? 'Пока нет задач. Создайте первую задачу в форме слева.'
                  : 'Пока нет задач.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  assignee={task.assignee}
                  status="pending"
                  priority={task.priority}
                  dueDate={task.dueDate}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
