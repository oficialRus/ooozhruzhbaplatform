import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { MODULES } from '@/config/modules';
import { useAuth } from '@/context/AuthContext';
import { DateInputRu } from '@/components/ui';
import { formatDateRu } from '@/utils/dateFormat';

type AccessLevel = 'none' | 'edit' | 'read';
type AccessRights = Record<string, AccessLevel>;

const buildDefaultAccessRights = (): AccessRights =>
  MODULES.reduce<AccessRights>((acc, moduleItem) => {
    acc[moduleItem.path] = 'none';
    return acc;
  }, {});

type Employee = {
  id: string;
  fullName: string;
  personnelNumber: string;
  accessRights?: AccessRights;
  login: string;
  position: string;
  hireDate: string;
  dismissalDate: string;
};

export default function EmployeesPage() {
  const { canEditModule } = useAuth();
  const canEditEmployees = canEditModule('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [personnelNumber, setPersonnelNumber] = useState('');
  const [login, setLogin] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [dismissalDate, setDismissalDate] = useState('');
  const [accessRights, setAccessRights] = useState<AccessRights>(() => buildDefaultAccessRights());
  const [showPassword, setShowPassword] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const resetForm = () => {
    setFullName('');
    setPersonnelNumber('');
    setLogin('');
    setPosition('');
    setPassword('');
    setHireDate('');
    setDismissalDate('');
    setAccessRights(buildDefaultAccessRights());
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setError('');
        const res = await fetch('/api/employees');
        if (!res.ok) {
          throw new Error('Не удалось загрузить сотрудников.');
        }
        const data = (await res.json()) as Employee[];
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки сотрудников.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          personnelNumber: personnelNumber.trim(),
          accessRights,
          login: login.trim(),
          password: password,
          position: position.trim(),
          hireDate: hireDate,
          dismissalDate: dismissalDate,
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Не удалось создать сотрудника.');
      }

      const created = (await res.json()) as Employee;
      setEmployees((prev) => [created, ...prev]);
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания сотрудника.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Не удалось удалить сотрудника.');
      }
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления сотрудника.');
    }
  };

  const getEmployeeAccessLevel = (employee: Employee, modulePath: string): AccessLevel => {
    const level = employee.accessRights?.[modulePath];
    if (level === 'edit' || level === 'read' || level === 'none') {
      return level;
    }
    return 'none';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Сотрудники</h2>
            <p className="text-sm text-text-muted">
              Управление доступом сотрудников: логины и пароли для входа в систему.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!canEditEmployees) return;
            resetForm();
            setIsFormOpen(true);
          }}
          disabled={!canEditEmployees}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Добавить сотрудника
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {!canEditEmployees && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          У вас режим чтения в разделе «Сотрудники». Редактирование и создание учетных записей недоступно.
        </div>
      )}

      {isFormOpen && canEditEmployees && (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-xl border border-border bg-surface-secondary space-y-4 max-w-xl xl:max-w-none"
          >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">Новый сотрудник</h3>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="text-sm text-text-muted hover:text-text-primary"
            >
              Отмена
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">ФИО</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Например: Иванов Иван Иванович"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Табельный номер</label>
              <input
                type="text"
                value={personnelNumber}
                onChange={(e) => setPersonnelNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="Например: T-00125"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Логин (email)</label>
                <input
                  type="email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="user@zhruzhba.ru"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="Придумайте временный пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Должность</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Например: Начальник смены"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Дата приёма (ДД.ММ.ГГГГ)</label>
                  <DateInputRu
                    value={hireDate}
                    onChange={setHireDate}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Дата увольнения (ДД.ММ.ГГГГ)</label>
                  <DateInputRu
                    value={dismissalDate}
                    onChange={setDismissalDate}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Сохранить
            </button>
          </div>
          </form>

          <div className="p-4 rounded-xl border border-border bg-surface-secondary">
            <h3 className="text-base font-semibold text-text-primary mb-3">Права доступа</h3>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary">
                    <th className="text-left py-2.5 px-3 font-medium text-text-secondary">Раздел</th>
                    <th className="text-left py-2.5 px-3 font-medium text-text-secondary w-[160px]">Доступ</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((moduleItem) => (
                    <tr key={moduleItem.path} className="border-b border-border last:border-b-0">
                      <td className="py-2.5 px-3 text-text-primary">{moduleItem.title}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={accessRights[moduleItem.path] ?? 'none'}
                          onChange={(e) =>
                            setAccessRights((prev) => ({
                              ...prev,
                              [moduleItem.path]: e.target.value as AccessLevel,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        >
                          <option value="none">Нет доступа</option>
                          <option value="read">Чтение</option>
                          <option value="edit">Редактирование</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              По умолчанию доступ к разделам закрыт, выдавайте права только на нужные вкладки.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-text-muted">Загрузка сотрудников...</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">
            Пока нет добавленных сотрудников. Нажмите «Добавить сотрудника», чтобы создать первую учетную запись.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">ФИО</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Табельный номер</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Логин</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Должность</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата приема</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата увольнения</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary w-[1%]"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedEmployee(e)}
                  >
                    <td className="py-2.5 px-4 text-text-primary">{e.fullName || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.personnelNumber || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.login || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.position || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{formatDateRu(e.hireDate)}</td>
                    <td className="py-2.5 px-4 text-text-primary">{formatDateRu(e.dismissalDate)}</td>
                    <td className="py-2.5 px-4 text-right">
                      {canEditEmployees && (
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            void handleDelete(e.id);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                          title="Удалить сотрудника"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="fixed inset-y-0 left-[260px] right-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-surface border border-border shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Права доступа сотрудника</h3>
                <p className="text-sm text-text-muted">{selectedEmployee.fullName}</p>
              </div>
              <button
                type="button"
                className="text-sm text-text-muted hover:text-text-primary"
                onClick={() => setSelectedEmployee(null)}
              >
                Закрыть
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary">
                      <th className="text-left py-2.5 px-3 font-medium text-text-secondary">Раздел</th>
                      <th className="text-left py-2.5 px-3 font-medium text-text-secondary">Уровень доступа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((moduleItem) => {
                      const level = getEmployeeAccessLevel(selectedEmployee, moduleItem.path);
                      return (
                        <tr key={moduleItem.path} className="border-b border-border last:border-b-0">
                          <td className="py-2.5 px-3 text-text-primary">{moduleItem.title}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={
                                level === 'edit'
                                  ? 'inline-flex rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium'
                                  : level === 'read'
                                    ? 'inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium'
                                    : 'inline-flex rounded-full bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-medium'
                              }
                            >
                              {level === 'edit' ? 'Редактирование' : level === 'read' ? 'Чтение' : 'Нет доступа'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

