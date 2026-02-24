import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { MOCK_CLIENTS, MOCK_NOMENCLATURE, MOCK_BRANDS } from '@/mocks/orders';
import type { Order } from '@/types';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

type NewOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: Order) => void;
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-text-primary';
const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

export default function NewOrderModal({ isOpen, onClose, onOrderCreated }: NewOrderModalProps) {
  const [month, setMonth] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const [nomenclatureId, setNomenclatureId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [packagingGrams, setPackagingGrams] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [quantityPackages, setQuantityPackages] = useState('');
  const [quant, setQuant] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [comments, setComments] = useState('');

  const quantityKgCalculated = useMemo(() => {
    const grams = Number(packagingGrams) || 0;
    const packs = Number(quantityPackages) || 0;
    if (grams && packs) return ((grams * packs) / 1000).toFixed(2);
    return '';
  }, [packagingGrams, quantityPackages]);

  const clientDisplayLabel = useMemo(() => {
    if (!clientId) return 'Выберите клиента';
    if (clientId === '__new__') return newClientName || 'Добавить нового клиента';
    return MOCK_CLIENTS.find((c) => c.id === clientId)?.name ?? 'Выберите клиента';
  }, [clientId, newClientName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = clientId === '__new__' ? newClientName : (MOCK_CLIENTS.find((c) => c.id === clientId)?.name ?? '');
    const nomenclatureName = MOCK_NOMENCLATURE.find((n) => n.id === nomenclatureId)?.name ?? '';
    const brandName = MOCK_BRANDS.find((b) => b.id === brandId)?.name ?? '';
    const order: Order = {
      id: `order-${Date.now()}`,
      month,
      registrationDate,
      clientName,
      nomenclatureName,
      brandName,
      packagingGrams,
      pricePerUnit,
      quantityPackages,
      quant,
      quantityKg: quantityKg || quantityKgCalculated,
      deliveryDeadline,
      deliveryCity,
      paymentDate,
      comments,
      status: 'new',
    };
    onOrderCreated?.(order);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый заказ" width="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Месяц */}
          <div>
            <label htmlFor="month" className={labelClass}>Месяц</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите месяц</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </div>

          {/* 2. Дата регистрации заказа */}
          <div>
            <label htmlFor="registrationDate" className={labelClass}>Дата регистрации заказа</label>
            <input
              id="registrationDate"
              type="date"
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* 3. Клиент */}
          <div ref={clientDropdownRef} className="relative">
            <label id="client-label" className={labelClass}>Клиент</label>
            <button
              type="button"
              id="client"
              onClick={() => setClientDropdownOpen((v) => !v)}
              className={`${inputClass} flex items-center justify-between gap-2 text-left`}
              aria-haspopup="listbox"
              aria-expanded={clientDropdownOpen}
              aria-labelledby="client-label"
            >
              <span className={clientId === '__new__' && !newClientName ? 'text-text-muted' : ''}>
                {clientDisplayLabel}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${clientDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {clientDropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg py-1 max-h-60 overflow-auto"
                role="listbox"
              >
                {MOCK_CLIENTS.map((c) => (
                  <li
                    key={c.id}
                    role="option"
                    aria-selected={clientId === c.id}
                    onClick={() => {
                      setClientId(c.id);
                      setNewClientName('');
                      setClientDropdownOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-hover"
                  >
                    {c.name}
                  </li>
                ))}
                <li
                  role="option"
                  aria-selected={clientId === '__new__'}
                  onClick={() => {
                    setClientId('__new__');
                    setClientDropdownOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-primary-500 font-medium cursor-pointer hover:bg-primary-50"
                >
                  Добавить нового клиента
                </li>
              </ul>
            )}
            {clientId === '__new__' && (
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Введите название нового клиента"
                className={`${inputClass} mt-2`}
                autoFocus
              />
            )}
          </div>

          {/* 4. Номенклатура продукции */}
          <div>
            <label htmlFor="nomenclature" className={labelClass}>Номенклатура продукции</label>
            <select
              id="nomenclature"
              value={nomenclatureId}
              onChange={(e) => setNomenclatureId(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите номенклатуру</option>
              {MOCK_NOMENCLATURE.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Бренд */}
          <div>
            <label htmlFor="brand" className={labelClass}>Бренд</label>
            <select
              id="brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите бренд</option>
              {MOCK_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* 6. Единица продукции. ФАСОВКА, грамм */}
          <div>
            <label htmlFor="packagingGrams" className={labelClass}>Единица продукции. ФАСОВКА, грамм</label>
            <input
              id="packagingGrams"
              type="number"
              min={0}
              step={1}
              value={packagingGrams}
              onChange={(e) => setPackagingGrams(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* 7. Цена отгрузки за единицу продукции, руб */}
          <div>
            <label htmlFor="pricePerUnit" className={labelClass}>Цена отгрузки за единицу продукции, руб</label>
            <input
              id="pricePerUnit"
              type="number"
              min={0}
              step={0.01}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          {/* 8. Кол-во в упаковках, шт. */}
          <div>
            <label htmlFor="quantityPackages" className={labelClass}>Кол-во в упаковках, шт.</label>
            <input
              id="quantityPackages"
              type="number"
              min={0}
              step={1}
              value={quantityPackages}
              onChange={(e) => setQuantityPackages(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* 9. Квант (шт в гофрокобе) */}
          <div>
            <label htmlFor="quant" className={labelClass}>Квант (шт в гофрокобе)</label>
            <input
              id="quant"
              type="number"
              min={0}
              step={1}
              value={quant}
              onChange={(e) => setQuant(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* 10. Кол-во в КГ (пересчет) */}
          <div>
            <label htmlFor="quantityKg" className={labelClass}>Кол-во в КГ (пересчёт)</label>
            <input
              id="quantityKg"
              type="text"
              value={quantityKg || quantityKgCalculated}
              onChange={(e) => setQuantityKg(e.target.value)}
              className={inputClass}
              placeholder={quantityKgCalculated || 'Рассчитывается по фасовке и кол-ву упаковок'}
            />
          </div>

          {/* 11. Требуемый срок поставки */}
          <div>
            <label htmlFor="deliveryDeadline" className={labelClass}>Требуемый срок поставки</label>
            <input
              id="deliveryDeadline"
              type="date"
              value={deliveryDeadline}
              onChange={(e) => setDeliveryDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* 12. Город доставки продукции */}
          <div>
            <label htmlFor="deliveryCity" className={labelClass}>Город доставки продукции</label>
            <input
              id="deliveryCity"
              type="text"
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              className={inputClass}
              placeholder="Например: Москва"
            />
          </div>

          {/* 13. Дата оплаты по договору */}
          <div>
            <label htmlFor="paymentDate" className={labelClass}>Дата оплаты по договору</label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* 14. Комментарии к заказу */}
        <div>
          <label htmlFor="comments" className={labelClass}>
            Комментарии к заказу (точка доставки, образец или ГП, другие детали)
          </label>
          <textarea
            id="comments"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className={inputClass}
            placeholder="Точка доставки, образец или ГП, другие детали по заказу"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Создать заказ
          </button>
        </div>
      </form>
    </Modal>
  );
}
