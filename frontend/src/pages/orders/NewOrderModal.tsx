import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { MOCK_CLIENTS, MOCK_NOMENCLATURE, MOCK_BRANDS } from '@/mocks/orders';
import type { Order } from '@/types';

type NewOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: Order) => void;
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-text-primary';
const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

const PACKAGING_GRAM_OPTIONS = [
  { value: '200', label: '200 г' },
  { value: '300', label: '300 г' },
  { value: '1700', label: '1700 г' },
  { value: '15000', label: '15000 г' },
];

const PACKAGING_FORMAT_OPTIONS = [
  'пластиковая упаковка 200 гр',
  'вакуумная упак. и картон. коробка, 200 гр',
  'брикет в рассоле 1.7 кг',
  'брикет в вакууме 1.7 кг',
  'куботейнер 15кг',
];

export type ProductLine = {
  id: string;
  nomenclatureId: string;
  brandId: string;
  packagingGrams: string;
  packagingFormat: string;
  /** Кол-во (шт.) по позиции — для расчёта кг по фасовке */
  quantity: string;
  discount: string;
  pricePerUnit: string;
};

const emptyProductLine = (): ProductLine => ({
  id: String(Date.now()),
  nomenclatureId: '',
  brandId: '',
  packagingGrams: '',
  packagingFormat: '',
  quantity: '',
  discount: '',
  pricePerUnit: '',
});

export default function NewOrderModal({ isOpen, onClose, onOrderCreated }: NewOrderModalProps) {
  const [registrationDate, setRegistrationDate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const clientTriggerRef = useRef<HTMLButtonElement>(null);
  const clientListPortalRef = useRef<HTMLDivElement>(null);
  const [productLines, setProductLines] = useState<ProductLine[]>(() => [emptyProductLine()]);
  const [openProductDropdown, setOpenProductDropdown] = useState<{ lineIndex: number; field: 'nomenclature' | 'brand' | 'packagingGrams' | 'packagingFormat' } | null>(null);
  const productTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const productListPortalRef = useRef<HTMLDivElement>(null);
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [comments, setComments] = useState('');

  /** Общее кол-во в кг. = сумма по позициям: (фасовка, г × кол-во, шт.) / 1000 */
  const totalQuantityKg = useMemo(() => {
    const sum = productLines.reduce((acc, line) => {
      const grams = Number(line.packagingGrams) || 0;
      const qty = Number(line.quantity) || 0;
      return acc + (grams * qty) / 1000;
    }, 0);
    return sum > 0 ? sum.toFixed(2) : '';
  }, [productLines]);

  /** Цена за единицу с учётом скидки по строке */
  const getPriceAfterDiscount = (line: ProductLine) => {
    const base = Number(line.pricePerUnit) || 0;
    const pct = Math.min(100, Math.max(0, Number(line.discount) || 0));
    if (pct <= 0) return base.toFixed(2);
    return (base * (1 - pct / 100)).toFixed(2);
  };

  /** Сумма заказа = сумма «Цена отгрузки со скидкой» по всем позициям */
  const totalOrderSum = useMemo(() => {
    const sum = productLines.reduce((acc, line) => acc + (Number(getPriceAfterDiscount(line)) || 0), 0);
    return sum.toFixed(2);
  }, [productLines]);

  /** Сумма цен без скидки по всем позициям */
  const totalBeforeDiscount = useMemo(() => {
    return productLines.reduce((acc, line) => acc + (Number(line.pricePerUnit) || 0), 0);
  }, [productLines]);

  /** Общая предоставленная скидка на заказ (руб.) = сумма без скидки − сумма заказа со скидкой */
  const totalDiscountAmount = useMemo(() => {
    const diff = totalBeforeDiscount - (Number(totalOrderSum) || 0);
    return diff <= 0 ? '0.00' : diff.toFixed(2);
  }, [totalBeforeDiscount, totalOrderSum]);

  const setProductLine = (lineIndex: number, patch: Partial<ProductLine>) => {
    setProductLines((prev) => prev.map((line, i) => (i === lineIndex ? { ...line, ...patch } : line)));
  };

  const addProductLine = () => {
    setProductLines((prev) => [...prev, emptyProductLine()]);
  };

  const clientDisplayLabel = useMemo(() => {
    if (!clientId) return 'Выберите клиента';
    if (clientId === '__new__') return newClientName || 'Добавить нового клиента';
    return MOCK_CLIENTS.find((c) => c.id === clientId)?.name ?? 'Выберите клиента';
  }, [clientId, newClientName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!clientDropdownRef.current?.contains(target) && !clientListPortalRef.current?.contains(target)) setClientDropdownOpen(false);
      const inProductTrigger = Object.values(productTriggerRefs.current).some((el) => el?.contains(target));
      if (!inProductTrigger && !productListPortalRef.current?.contains(target)) setOpenProductDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const anyDropdownOpen = clientDropdownOpen || openProductDropdown !== null;

  useEffect(() => {
    if (!anyDropdownOpen) return;
    const handleScroll = (e: Event) => {
      const inClientList = clientListPortalRef.current?.contains(e.target as Node);
      const inProductList = productListPortalRef.current?.contains(e.target as Node);
      if (!inClientList) setClientDropdownOpen(false);
      if (!inProductList) setOpenProductDropdown(null);
    };
    const handleResize = () => {
      setClientDropdownOpen(false);
      setOpenProductDropdown(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [anyDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = clientId === '__new__' ? newClientName : (MOCK_CLIENTS.find((c) => c.id === clientId)?.name ?? '');
    const monthFromDate = (() => {
      if (!registrationDate) return '';
      const d = new Date(registrationDate);
      if (Number.isNaN(d.getTime())) return '';
      return String(d.getMonth() + 1);
    })();
    productLines.forEach((line, index) => {
      const order: Order = {
        id: `order-${Date.now()}-${index}`,
        orderNumber: orderNumber.trim() || undefined,
        month: monthFromDate,
        registrationDate,
        clientName,
        nomenclatureName: MOCK_NOMENCLATURE.find((n) => n.id === line.nomenclatureId)?.name ?? '',
        brandName: MOCK_BRANDS.find((b) => b.id === line.brandId)?.name ?? '',
        packagingGrams: line.packagingGrams,
        packagingFormat: line.packagingFormat,
        pricePerUnit: getPriceAfterDiscount(line),
        discount: line.discount,
        quantityPackages: totalOrderSum,
        quant: totalDiscountAmount,
        quantityKg: totalQuantityKg,
        deliveryDeadline,
        deliveryCity,
        paymentDate,
        comments,
        status: 'new',
      };
      onOrderCreated?.(order);
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый заказ" width="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Оглавление заказа: основная строка с ключевыми полями */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {/* Дата регистрации заказа (слева) */}
            <div className="min-w-[200px]">
              <label htmlFor="registrationDate" className={labelClass}>Дата регистрации заказа</label>
              <input
                id="registrationDate"
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Номер заказа */}
            <div className="min-w-[200px]">
              <label htmlFor="orderNumber" className={labelClass}>Номер заказа</label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className={inputClass}
                placeholder="Например: З-001"
              />
            </div>

            {/* Клиент (справа от даты регистрации) */}
            <div ref={clientDropdownRef} className="relative min-w-[240px]">
              <label id="client-label" className={labelClass}>Клиент</label>
              <button
                ref={clientTriggerRef}
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
              {clientDropdownOpen && clientTriggerRef.current && createPortal(
                <div
                  ref={clientListPortalRef}
                  className="fixed z-[100] rounded-lg border border-border bg-surface shadow-xl py-1 max-h-60 overflow-auto"
                  style={{
                    top: clientTriggerRef.current.getBoundingClientRect().bottom + 4,
                    left: clientTriggerRef.current.getBoundingClientRect().left,
                    width: clientTriggerRef.current.getBoundingClientRect().width,
                    minWidth: 200,
                  }}
                  role="listbox"
                >
                  {MOCK_CLIENTS.map((c) => (
                    <div
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
                    </div>
                  ))}
                  <div
                    role="option"
                    aria-selected={clientId === '__new__'}
                    onClick={() => {
                      setClientId('__new__');
                      setClientDropdownOpen(false);
                    }}
                    className="px-3 py-2 text-sm text-primary-500 font-medium cursor-pointer hover:bg-primary-50"
                  >
                    Добавить нового клиента
                  </div>
                </div>,
                document.body
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

            {/* Требуемый срок поставки */}
            <div className="min-w-[200px]">
              <label htmlFor="deliveryDeadline" className={labelClass}>Требуемый срок поставки</label>
              <input
                id="deliveryDeadline"
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Город доставки продукции */}
            <div className="min-w-[220px]">
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

            {/* Дата оплаты по договору */}
            <div className="min-w-[200px]">
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
        </div>

        {/* Строки товаров: номенклатура, бренд, фасовка, формат, скидка, цена — можно добавлять строки по кнопке + */}
        {productLines.map((line, lineIndex) => (
          <div key={line.id} className="overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {/* Номенклатура продукции */}
              <div className="relative min-w-[230px]">
                <label className={labelClass}>Номенклатура продукции</label>
                <button
                  ref={(el) => { productTriggerRefs.current[`${lineIndex}-nomenclature`] = el; }}
                  type="button"
                  onClick={() => setOpenProductDropdown((prev) => (prev?.lineIndex === lineIndex && prev?.field === 'nomenclature' ? null : { lineIndex, field: 'nomenclature' }))}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                  aria-haspopup="listbox"
                  aria-expanded={openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'nomenclature'}
                >
                  <span className={!line.nomenclatureId ? 'text-text-muted' : ''}>
                    {line.nomenclatureId ? MOCK_NOMENCLATURE.find((n) => n.id === line.nomenclatureId)?.name : 'Выберите номенклатуру'}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'nomenclature' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Бренд */}
              <div className="relative min-w-[140px]">
                <label className={labelClass}>Бренд</label>
                <button
                  ref={(el) => { productTriggerRefs.current[`${lineIndex}-brand`] = el; }}
                  type="button"
                  onClick={() => setOpenProductDropdown((prev) => (prev?.lineIndex === lineIndex && prev?.field === 'brand' ? null : { lineIndex, field: 'brand' }))}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                  aria-haspopup="listbox"
                  aria-expanded={openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'brand'}
                >
                  <span className={!line.brandId ? 'text-text-muted' : ''}>
                    {line.brandId ? MOCK_BRANDS.find((b) => b.id === line.brandId)?.name : 'Выберите бренд'}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'brand' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Ед. прод. ФАС, грамм */}
              <div className="relative min-w-[200px]">
                <label className={labelClass}>Ед. прод. ФАС, грамм</label>
                <button
                  ref={(el) => { productTriggerRefs.current[`${lineIndex}-packagingGrams`] = el; }}
                  type="button"
                  onClick={() => setOpenProductDropdown((prev) => (prev?.lineIndex === lineIndex && prev?.field === 'packagingGrams' ? null : { lineIndex, field: 'packagingGrams' }))}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                  aria-haspopup="listbox"
                  aria-expanded={openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'packagingGrams'}
                >
                  <span className={!line.packagingGrams ? 'text-text-muted' : ''}>
                    {line.packagingGrams ? PACKAGING_GRAM_OPTIONS.find((o) => o.value === line.packagingGrams)?.label : 'Выберите фасовку'}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'packagingGrams' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Формат упаковки */}
              <div className="relative min-w-[230px]">
                <label className={labelClass}>Формат упаковки</label>
                <button
                  ref={(el) => { productTriggerRefs.current[`${lineIndex}-packagingFormat`] = el; }}
                  type="button"
                  onClick={() => setOpenProductDropdown((prev) => (prev?.lineIndex === lineIndex && prev?.field === 'packagingFormat' ? null : { lineIndex, field: 'packagingFormat' }))}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                  aria-haspopup="listbox"
                  aria-expanded={openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'packagingFormat'}
                >
                  <span className={!line.packagingFormat ? 'text-text-muted' : ''}>
                    {line.packagingFormat || 'Выберите формат упаковки'}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${openProductDropdown?.lineIndex === lineIndex && openProductDropdown?.field === 'packagingFormat' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Кол-во, шт. */}
              <div className="min-w-[90px]">
                <label className={labelClass}>Кол-во, шт.</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={line.quantity}
                  onChange={(e) => setProductLine(lineIndex, { quantity: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              {/* Цена отгр. за ед. прод. */}
              <div className="min-w-[190px]">
                <label className={labelClass}>Цена отгр. за ед. прод.</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={line.pricePerUnit}
                  onChange={(e) => setProductLine(lineIndex, { pricePerUnit: e.target.value })}
                  className={inputClass}
                  placeholder="0.00"
                />
                {line.discount && Number(line.discount) > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    Цена со скидкой: {getPriceAfterDiscount(line)} руб.
                  </p>
                )}
              </div>

              {/* Скидка, % */}
              <div className="min-w-[95px]">
                <label className={labelClass}>Скидка, %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={line.discount}
                  onChange={(e) => setProductLine(lineIndex, { discount: e.target.value })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              {/* Цена отгр. за ед. со скидк. */}
              <div className="min-w-[175px]">
                <label className={labelClass}>Цена отгр. за ед. со скидк.</label>
                <input
                  type="text"
                  readOnly
                  value={line.pricePerUnit ? `${getPriceAfterDiscount(line)} руб.` : '—'}
                  className={`${inputClass} bg-surface-secondary cursor-default`}
                  aria-readonly
                />
              </div>

              {/* Итог цена (цена со скидкой × кол-во по позиции) */}
              <div className="min-w-[155px]">
                <label className={labelClass}>Итог цена</label>
                <input
                  type="text"
                  readOnly
                  value={
                    line.pricePerUnit && line.quantity
                      ? `${(Number(getPriceAfterDiscount(line)) * (Number(line.quantity) || 0)).toFixed(2)} руб.`
                      : '—'
                  }
                  className={`${inputClass} bg-surface-secondary cursor-default`}
                  aria-readonly
                />
              </div>
            </div>
          </div>
        ))}

        {/* Кнопка добавления строки товара */}
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={addProductLine}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-500 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/30 transition-colors"
            aria-label="Добавить позицию"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>Добавить позицию</span>
          </button>
        </div>

        {/* Портал выпадающего списка для строк товаров (номенклатура / бренд / фасовка / формат) */}
        {openProductDropdown !== null && (() => {
          const key = `${openProductDropdown.lineIndex}-${openProductDropdown.field}`;
          const trigger = productTriggerRefs.current[key];
          const line = productLines[openProductDropdown.lineIndex];
          if (!trigger || !line) return null;
          const rect = trigger.getBoundingClientRect();
          const style = { top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200) };
          if (openProductDropdown.field === 'nomenclature') {
            return createPortal(
              <div ref={productListPortalRef} className="fixed z-[100] rounded-lg border border-border bg-surface shadow-xl py-1 max-h-60 overflow-auto" style={style} role="listbox">
                {MOCK_NOMENCLATURE.map((n) => (
                  <div key={n.id} role="option" aria-selected={line.nomenclatureId === n.id} onClick={() => { setProductLine(openProductDropdown.lineIndex, { nomenclatureId: n.id }); setOpenProductDropdown(null); }} className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-hover">{n.name}</div>
                ))}
              </div>,
              document.body
            );
          }
          if (openProductDropdown.field === 'brand') {
            return createPortal(
              <div ref={productListPortalRef} className="fixed z-[100] rounded-lg border border-border bg-surface shadow-xl py-1 max-h-60 overflow-auto" style={style} role="listbox">
                {MOCK_BRANDS.map((b) => (
                  <div key={b.id} role="option" aria-selected={line.brandId === b.id} onClick={() => { setProductLine(openProductDropdown.lineIndex, { brandId: b.id }); setOpenProductDropdown(null); }} className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-hover">{b.name}</div>
                ))}
              </div>,
              document.body
            );
          }
          if (openProductDropdown.field === 'packagingGrams') {
            return createPortal(
              <div ref={productListPortalRef} className="fixed z-[100] rounded-lg border border-border bg-surface shadow-xl py-1 max-h-60 overflow-auto" style={style} role="listbox">
                {PACKAGING_GRAM_OPTIONS.map((opt) => (
                  <div key={opt.value} role="option" aria-selected={line.packagingGrams === opt.value} onClick={() => { setProductLine(openProductDropdown.lineIndex, { packagingGrams: opt.value }); setOpenProductDropdown(null); }} className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-hover">{opt.label}</div>
                ))}
              </div>,
              document.body
            );
          }
          if (openProductDropdown.field === 'packagingFormat') {
            return createPortal(
              <div ref={productListPortalRef} className="fixed z-[100] rounded-lg border border-border bg-surface shadow-xl py-1 max-h-60 overflow-auto" style={style} role="listbox">
                {PACKAGING_FORMAT_OPTIONS.map((opt) => (
                  <div key={opt} role="option" aria-selected={line.packagingFormat === opt} onClick={() => { setProductLine(openProductDropdown.lineIndex, { packagingFormat: opt }); setOpenProductDropdown(null); }} className="px-3 py-2 text-sm text-text-primary cursor-pointer hover:bg-surface-hover">{opt}</div>
                ))}
              </div>,
              document.body
            );
          }
          return null;
        })()}

        {/* Третья строка: Сумма заказа, Предоставленная скидка, Общее кол-во в кг. */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {/* Сумма заказа (сумма цен со скидкой по всем позициям) */}
            <div className="min-w-[180px]">
              <label htmlFor="quantityPackages" className={labelClass}>Сумма заказа</label>
              <input
                id="quantityPackages"
                type="text"
                readOnly
                value={totalOrderSum ? `${totalOrderSum} руб.` : '—'}
                className={`${inputClass} bg-surface-secondary cursor-default`}
                aria-readonly
              />
            </div>

            {/* Предоставленная скидка (общая по заказу: сумма без скидки − сумма со скидкой) */}
            <div className="min-w-[180px]">
              <label htmlFor="quant" className={labelClass}>Предоставленная скидка</label>
              <input
                id="quant"
                type="text"
                readOnly
                value={Number(totalDiscountAmount) > 0 ? `${totalDiscountAmount} руб.` : '—'}
                className={`${inputClass} bg-surface-secondary cursor-default`}
                aria-readonly
              />
            </div>

            {/* Общее кол-во в кг. (сумма по позициям: фасовка × кол-во) */}
            <div className="min-w-[180px]">
              <label htmlFor="quantityKg" className={labelClass}>Общее кол-во в кг.</label>
              <input
                id="quantityKg"
                type="text"
                readOnly
                value={totalQuantityKg ? `${totalQuantityKg} кг` : '—'}
                className={`${inputClass} bg-surface-secondary cursor-default`}
                aria-readonly
              />
            </div>
          </div>
        </div>

        {/* Комментарии к заказу */}
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
