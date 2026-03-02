import { useState, Fragment } from 'react';
import { ClipboardList, Plus, Search, Filter, Check } from 'lucide-react';
import type { Order } from '@/types';
import NewOrderModal from './NewOrderModal';

const STATUS_LABELS: Record<Order['status'], string> = {
  new: 'Новый',
  in_progress: 'В работе',
  shipped: 'Отгружен',
  completed: 'Выполнен',
};

export default function OrdersPage() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.nomenclatureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <button
          type="button"
          onClick={() => setIsNewOrderOpen(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Новый заказ
        </button>
      </div>

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={(order) => setOrders((prev) => [order, ...prev])}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Поиск по заказам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors">
          <Filter className="w-4 h-4" />
          Фильтры
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {orders.length === 0 ? 'Нет заказов' : 'Ничего не найдено'}
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              {orders.length === 0
                ? 'Создайте первый заказ, нажав кнопку «Новый заказ».'
                : 'Попробуйте изменить поисковый запрос.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата регистрации</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Клиент</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Номенклатура</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Бренд</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Кол-во, кг</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Срок поставки</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Город</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <Fragment key={order.id}>
                    <tr className="border-b border-border hover:bg-surface-hover transition-colors">
                      <td className={`py-3 px-4 text-text-primary ${index > 0 ? 'pt-8' : ''}`}>{order.registrationDate || '—'}</td>
                      <td className="py-3 px-4 text-text-primary">{order.clientName || '—'}</td>
                      <td className="py-3 px-4 text-text-primary">{order.nomenclatureName || '—'}</td>
                      <td className="py-3 px-4 text-text-primary">{order.brandName || '—'}</td>
                      <td className="py-3 px-4 text-text-primary text-right">{order.quantityKg || '—'}</td>
                      <td className="py-3 px-4 text-text-primary">{order.deliveryDeadline || '—'}</td>
                      <td className="py-3 px-4 text-text-primary">{order.deliveryCity || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'new'
                              ? 'bg-primary-100 text-primary-700'
                              : order.status === 'in_progress'
                                ? 'bg-warning-100 text-warning-600'
                                : order.status === 'shipped'
                                  ? 'bg-accent-100 text-accent-700'
                                  : 'bg-surface-hover text-text-secondary'
                          }`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-surface-secondary/50 border-b-4 border-border">
                      <td colSpan={8} className="px-4 py-4 pb-8 align-top">
                        <p className="text-xs text-text-muted mb-2">Утверждение заказа.</p>
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          <div className="flex items-center justify-between gap-4 min-w-[140px]">
                            <span className="text-sm text-text-primary">Количество</span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white" title="Утверждено">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 min-w-[140px]">
                            <span className="text-sm text-text-primary">Сроки</span>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white" title="Утверждено">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {index < filteredOrders.length - 1 && (
                      <tr className="bg-border/30">
                        <td colSpan={8} className="h-3 p-0" aria-hidden />
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
