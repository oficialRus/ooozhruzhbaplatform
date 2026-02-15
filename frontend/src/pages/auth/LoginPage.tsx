import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Неверный email или пароль');
      }
    } catch {
      setError('Ошибка авторизации. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary-700/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white text-2xl font-bold mb-4 shadow-lg shadow-primary-500/30">
            Ж
          </div>
          <h1 className="text-2xl font-bold text-white">ООО Жрушба</h1>
          <p className="text-slate-400 mt-1">Платформа управления предприятием</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Вход в систему</h2>
          <p className="text-sm text-text-muted mb-6">
            Введите данные для входа в личный кабинет
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-danger-50 text-danger-600 text-sm p-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@zhruzhba.ru"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Войти
                </>
              )}
            </button>
          </form>

          {/* Demo accounts hint */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-3">
              Демо-аккаунты для входа (пароль: любой):
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { email: 'admin@zhruzhba.ru', label: 'Директор' },
                { email: 'orders@zhruzhba.ru', label: 'Заказы' },
                { email: 'production@zhruzhba.ru', label: 'Производство' },
                { email: 'warehouse@zhruzhba.ru', label: 'Склад' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('demo');
                  }}
                  className="text-xs text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md px-2 py-1.5 transition-colors text-center"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
