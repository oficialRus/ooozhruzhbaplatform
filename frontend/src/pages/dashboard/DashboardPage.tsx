import { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, Plus } from 'lucide-react';
import { TaskItem } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { MOCK_USERS } from '@/mocks/users';

type TaskPriority = 'low' | 'medium' | 'high';

interface DashboardTask {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  dueDate?: string;
  status: 'pending' | 'done';
  /** id пользователя, создавшего задачу (для вкладки «Поставил») */
  createdBy?: string;
}

type TaskListTab = 'created' | 'received';

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
  const [taskListTab, setTaskListTab] = useState<TaskListTab>('created');
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const TASK_CREATOR_ROLES: string[] = ['admin', 'orders', 'production', 'materials'];
  const canCreateTasks = user != null && TASK_CREATOR_ROLES.includes(user.role);
  const canChangeTaskStatus = user?.role === 'admin';

  if (!user) return null;

  useEffect(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as DashboardTask[];
      setTasks(
        parsed.map((task) => ({
          ...task,
          status: task.status ?? 'pending',
        })),
      );
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
      status: 'pending',
      createdBy: user.id,
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
    setAssignee('');
    setPriority('medium');
    setDueDate('');
  };

  const toggleTaskStatus = (id: string) => {
    if (!canChangeTaskStatus) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'done' ? 'pending' : 'done',
            }
          : task,
      ),
    );
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
          <section className="xl:col-span-2 bg-surface rounded-xl border border-border p-5 relative z-10">
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

              <div className="relative">
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary-300 appearance-auto cursor-pointer"
                >
                <option value="">Не назначен</option>
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.fullName}>
                    {u.fullName} — {u.position}
                  </option>
                ))}
              </select>
              </div>

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
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border bg-surface-secondary/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setTaskListTab('created')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    taskListTab === 'created'
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Поставил
                </button>
                <button
                  type="button"
                  onClick={() => setTaskListTab('received')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    taskListTab === 'received'
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Получил
                </button>
              </div>
              <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                {taskListTab === 'created'
                  ? tasks.filter((t) => t.createdBy === user.id).length
                  : tasks.filter((t) => t.assignee === user.fullName).length}{' '}
                шт.
              </span>
            </div>
          </div>

          {(() => {
            const createdTasks = tasks.filter((t) => t.createdBy === user.id);
            const receivedTasks = tasks.filter((t) => t.assignee === user.fullName);
            const list = taskListTab === 'created' ? createdTasks : receivedTasks;
            const isEmpty = list.length === 0;

            return isEmpty ? (
              <div className="text-center py-10">
                <ClipboardList className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">
                  {taskListTab === 'created'
                    ? canCreateTasks
                      ? 'Вы ещё не создавали задач. Создайте задачу в форме слева.'
                      : 'Пока нет задач, которые вы поставили.'
                    : 'Вам пока не назначили задач.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {list.map((task) => (
                  <TaskItem
                    key={task.id}
                    title={task.title}
                    assignee={task.assignee}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate}
                    canChangeStatus={canChangeTaskStatus}
                    onToggleStatus={() => toggleTaskStatus(task.id)}
                  />
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
