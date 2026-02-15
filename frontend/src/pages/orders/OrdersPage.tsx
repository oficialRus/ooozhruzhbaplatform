import { ClipboardList, Plus, Search, Filter } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Приемка заказов</h2>
            <p className="text-sm text-text-muted">Управление входящими заказами</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" />
          Новый заказ
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Поиск по заказам..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors">
          <Filter className="w-4 h-4" />
          Фильтры
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Модуль в разработке</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Здесь будет полный функционал приемки заказов: создание, редактирование, отслеживание статусов и история.
        </p>
      </div>
    </div>
  );
}
