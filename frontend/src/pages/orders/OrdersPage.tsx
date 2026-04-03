import { useState, useMemo, Fragment } from 'react';
import { ClipboardList, Plus, Search, Filter, Check, ChevronDown, ChevronRight } from 'lucide-react';
import type { Order } from '@/types';
import NewOrderModal from './NewOrderModal';
import { useAuth } from '@/context/AuthContext';
import { formatDateRu } from '@/utils/dateFormat';

function groupOrdersByDateAndClient(orders: Order[]): { key: string; registrationDate: string; clientName: string; orders: Order[] }[] {
  const map = new Map<string, Order[]>();
  for (const o of orders) {
    const key = `${o.registrationDate || ''}|${o.clientName || ''}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(o);
  }
  return Array.from(map.entries()).map(([key, ordersInGroup]) => ({
    key,
    registrationDate: ordersInGroup[0]?.registrationDate ?? '',
    clientName: ordersInGroup[0]?.clientName ?? '',
    orders: ordersInGroup,
  }));
}

const STATUS_LABELS: Record<Order['status'], string> = {
  new: 'Новый',
  in_progress: 'В работе',
  shipped: 'Отгружен',
  completed: 'Выполнен',
};

export default function OrdersPage() {
  const { canEditModule } = useAuth();
  const canEditOrders = canEditModule('orders');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const filteredOrders = orders.filter(
    (o) =>
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.nomenclatureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryCity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = useMemo(() => groupOrdersByDateAndClient(filteredOrders), [filteredOrders]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Коммерческие заказы</h2>
            <p className="text-sm text-text-muted">Управление входящими заказами</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!canEditOrders) return;
            setIsNewOrderOpen(true);
          }}
          disabled={!canEditOrders}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Новый заказ
        </button>
      </div>

      {!canEditOrders && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          У вас режим чтения в разделе «Коммерческие заказы». Создание и редактирование заказов недоступно.
        </div>
      )}

      <NewOrderModal
        isOpen={isNewOrderOpen && canEditOrders}
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
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Наш номер</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Номер заказа</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата регистрации</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Клиент</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Номенклатура</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Бренд</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Кол-во, кг</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Срок поставки</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Город</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Количество</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Сроки</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isExpanded = expandedGroups.has(group.key);
                  const count = group.orders.length;
                  const countLabel = count === 1 ? '1 заказ' : count < 5 ? `${count} заказа` : `${count} заказов`;
                  return (
                    <Fragment key={group.key}>
                      <tr
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleGroup(group.key)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.key); } }}
                        className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer select-none"
                        aria-expanded={isExpanded}
                      >
                        <td className="py-3 px-4 text-text-muted">—</td>
                        <td className="py-3 px-4 text-text-muted">—</td>
                        <td className="py-3 px-4 text-text-primary">
                          {formatDateRu(group.registrationDate)}
                        </td>
                        <td className="py-3 px-4 text-text-primary font-medium">{group.clientName || '—'}</td>
                        <td className="py-3 px-4 text-text-secondary" colSpan={3}>
                          <span className="inline-flex items-center gap-1.5">
                            {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                            {countLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4" colSpan={5} />
                      </tr>
                      {isExpanded &&
                        group.orders.map((order) => (
                          <Fragment key={order.id}>
                            <tr className="border-b border-border hover:bg-surface-hover/50 transition-colors bg-surface-secondary/30">
                              <td className="py-2.5 px-4 text-text-primary font-medium">
                                {order.ourOrderNumber || order.id || '—'}
                              </td>
                              <td className="py-2.5 px-4 text-text-primary font-medium">
                                {order.orderNumber || '—'}
                              </td>
                              <td className="py-2.5 px-4 text-text-muted text-xs w-[1%]" />
                              <td className="py-2.5 px-4 text-text-muted text-xs w-[1%]" />
                              <td className="py-2.5 px-4 text-text-primary">{order.nomenclatureName || '—'}</td>
                              <td className="py-2.5 px-4 text-text-primary">{order.brandName || '—'}</td>
                              <td className="py-2.5 px-4 text-text-primary text-right">{order.quantityKg || '—'}</td>
                              <td className="py-2.5 px-4 text-text-primary">{order.deliveryDeadline || '—'}</td>
                              <td className="py-2.5 px-4 text-text-primary">{order.deliveryCity || '—'}</td>
                              <td className="py-2.5 px-4">
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
                              <td className="py-2.5 px-4">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white" title="Утверждено">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white" title="Утверждено">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
