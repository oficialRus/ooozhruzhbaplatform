import { BoxSelect } from 'lucide-react';

export default function PackagingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <BoxSelect className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Фасовка</h2>
          <p className="text-sm text-text-muted">Управление процессом фасовки</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <BoxSelect className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Модуль в разработке</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Здесь будет управление фасовкой: очереди, задания, контроль объемов, маркировка.
        </p>
      </div>
    </div>
  );
}
