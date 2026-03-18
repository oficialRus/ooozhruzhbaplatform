import { useState } from 'react';
import { Users, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

type Employee = {
  id: string;
  fullName: string;
  login: string;
  position: string;
  hireDate: string;
  dismissalDate: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [login, setLogin] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [dismissalDate, setDismissalDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployees((prev) => [
      {
        id: crypto.randomUUID(),
        fullName: fullName.trim(),
        login: login.trim(),
        position: position.trim(),
        hireDate: hireDate,
        dismissalDate: dismissalDate,
      },
      ...prev,
    ]);
    setFullName('');
    setLogin('');
    setPosition('');
    setPassword('');
    setHireDate('');
    setDismissalDate('');
    setIsFormOpen(false);
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
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Добавить сотрудника
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-border bg-surface-secondary space-y-4 max-w-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">Новый сотрудник</h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
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
                  <label className="block text-sm text-text-secondary mb-1">Дата приема</label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Дата увольнения</label>
                  <input
                    type="date"
                    value={dismissalDate}
                    onChange={(e) => setDismissalDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
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
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-text-muted">
            Пока нет добавленных сотрудников. Нажмите «Добавить сотрудника», чтобы создать первую учетную запись.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">ФИО</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Логин</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Должность</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата приема</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата увольнения</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary w-[1%]"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                    <td className="py-2.5 px-4 text-text-primary">{e.fullName || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.login || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.position || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.hireDate || '—'}</td>
                    <td className="py-2.5 px-4 text-text-primary">{e.dismissalDate || '—'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setEmployees((prev) => prev.filter((emp) => emp.id !== e.id))
                        }
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                        title="Удалить сотрудника"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

