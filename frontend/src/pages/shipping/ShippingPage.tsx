import { Truck } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
          <Truck className="w-5 h-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Отгрузка и накладные</h2>
          <p className="text-sm text-text-muted">Формирование накладных и контроль отгрузки</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-12 text-center">
        <Truck className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Модуль в разработке</h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Здесь будет управление отгрузкой: формирование накладных, маршруты, статусы доставки.
        </p>
      </div>
    </div>
  );
}
