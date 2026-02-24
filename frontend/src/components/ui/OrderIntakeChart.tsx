import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const MOCK_ORDER_INTAKE = [
  { period: 'Пн', orders: 18 },
  { period: 'Вт', orders: 24 },
  { period: 'Ср', orders: 21 },
  { period: 'Чт', orders: 29 },
  { period: 'Пт', orders: 34 },
  { period: 'Сб', orders: 17 },
  { period: 'Вс', orders: 12 },
];

export default function OrderIntakeChart() {
  return (
    <section className="bg-surface rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-text-primary">
          Приемка заказов за неделю
        </h3>
        <p className="text-sm text-text-secondary mt-1">
          Демонстрационные данные (заглушка)
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_ORDER_INTAKE}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis
              dataKey="period"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
              }}
              formatter={(value: number | undefined) => [`${value ?? 0} шт.`, 'Заказы']}
            />
            <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
