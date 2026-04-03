import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Flame, Beaker, Plus, Check, Download, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DateInputRu } from '@/components/ui';
import { formatDateRu, formatDateRuOrEmpty, todayIsoLocal } from '@/utils/dateFormat';

interface MilkQualityAnalysis {
  id: string;
  date: string;
  batch?: string;
  temperature: string;
  fat: string;
  ph: string;
  protein: string;
  organoleptic: string;
  passed: boolean;
  registrationId?: string;
}

interface MilkRegistration {
  id: string;
  batchNumber: string;
  registrationNumber: string;
  date: string;
  supplier: string;
  milkType: string;
  liters: string;
  kg: string;
  docsNote: string;
  analysisId?: string;
}

const MILK_DENSITY_KG_PER_L: number = 1.03;

/** Следующий номер регистрации РМ-NNNNNN по уже сохранённым поступлениям. */
function getNextRegistrationNumber(existing: MilkRegistration[]): string {
  let max = 0;
  for (const r of existing) {
    const m = r.registrationNumber.match(/(\d+)\s*$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `РМ-${String(max + 1).padStart(6, '0')}`;
}

function downloadMilkRegistrationsExcel(
  registrations: MilkRegistration[],
  analyses: MilkQualityAnalysis[],
): void {
  const rows = registrations.map((r) => {
    const hasAnalysis = !!(r.analysisId && analyses.some((a) => a.id === r.analysisId));
    return {
      '№ рег.': r.registrationNumber || '',
      'Номер партии': r.batchNumber || '',
      Дата: formatDateRuOrEmpty(r.date) || r.date || '',
      Поставщик: r.supplier || '',
      'Вид молока': r.milkType || '',
      'Кол-во, л': r.liters || '',
      'Кол-во, кг': r.kg || '',
      'Сканы документов': r.docsNote || '',
      Анализ: hasAnalysis ? 'Привязан' : 'Не привязан',
    };
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Поступления');
  const buf = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const n = new Date();
  const y = n.getFullYear();
  const mo = String(n.getMonth() + 1).padStart(2, '0');
  const d = String(n.getDate()).padStart(2, '0');
  a.download = `postupleniya_moloka_${formatDateRu(`${y}-${mo}-${d}`).replace(/\./g, '-')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

const initialAnalysis: Omit<MilkQualityAnalysis, 'id'> = {
  date: todayIsoLocal(),
  batch: '',
  temperature: '',
  fat: '',
  ph: '',
  protein: '',
  organoleptic: '',
  passed: false,
};

export default function ProductionPage() {
  const { canEditModule } = useAuth();
  const canEditProduction = canEditModule('production');
  const [analyses, setAnalyses] = useState<MilkQualityAnalysis[]>([]);
  const [registrations, setRegistrations] = useState<MilkRegistration[]>([]);
  const [form, setForm] = useState(initialAnalysis);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'registration'>('registration');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationAnalysisId, setRegistrationAnalysisId] = useState<string | undefined>(undefined);
  const [analysisRegistrationId, setAnalysisRegistrationId] = useState<string | undefined>(undefined);
  const [analysisToView, setAnalysisToView] = useState<MilkQualityAnalysis | null>(null);
  const [registrationToView, setRegistrationToView] = useState<MilkRegistration | null>(null);

  const [registrationBatchNumber, setRegistrationBatchNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationDate, setRegistrationDate] = useState(todayIsoLocal());
  const [registrationSupplier, setRegistrationSupplier] = useState('');
  const [registrationMilkType, setRegistrationMilkType] = useState('');
  const [registrationLiters, setRegistrationLiters] = useState('');
  const [registrationKg, setRegistrationKg] = useState('');
  const [registrationDocsNote, setRegistrationDocsNote] = useState('');
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | undefined>(
    undefined,
  );
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | undefined>(undefined);

  const loadRegistrationIntoForm = (r: MilkRegistration) => {
    setRegistrationBatchNumber(r.batchNumber);
    setRegistrationNumber(r.registrationNumber);
    setRegistrationDate(r.date);
    setRegistrationSupplier(r.supplier);
    setRegistrationMilkType(r.milkType);
    setRegistrationLiters(r.liters);
    setRegistrationKg(r.kg);
    setRegistrationDocsNote(r.docsNote);
    setRegistrationAnalysisId(r.analysisId);
  };

  const setField = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLitersChange = (value: string) => {
    setRegistrationLiters(value);
    const numeric = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(numeric)) {
      setRegistrationKg('');
      return;
    }
    const kg = numeric * MILK_DENSITY_KG_PER_L;
    setRegistrationKg(kg.toFixed(2));
  };

  const handleKgChange = (value: string) => {
    setRegistrationKg(value);
    const numeric = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(numeric) || MILK_DENSITY_KG_PER_L === 0) {
      setRegistrationLiters('');
      return;
    }
    const liters = numeric / MILK_DENSITY_KG_PER_L;
    setRegistrationLiters(liters.toFixed(2));
  };

  const resetRegistrationFormFields = (regsForNext: MilkRegistration[]) => {
    setRegistrationBatchNumber('');
    setRegistrationNumber(getNextRegistrationNumber(regsForNext));
    setRegistrationDate(todayIsoLocal());
    setRegistrationSupplier('');
    setRegistrationMilkType('');
    setRegistrationLiters('');
    setRegistrationKg('');
    setRegistrationDocsNote('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnalysisId) {
      const prevRow = analyses.find((a) => a.id === editingAnalysisId);
      const registrationId = analysisRegistrationId ?? prevRow?.registrationId;
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === editingAnalysisId
            ? {
                ...form,
                id: editingAnalysisId,
                registrationId,
              }
            : a,
        ),
      );
    } else {
      const newAnalysis: MilkQualityAnalysis = {
        ...form,
        id: crypto.randomUUID(),
        registrationId: analysisRegistrationId,
      };
      setAnalyses((prev) => [newAnalysis, ...prev]);
      if (analysisRegistrationId) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === analysisRegistrationId ? { ...r, analysisId: newAnalysis.id } : r,
          ),
        );
      }
    }
    setForm(initialAnalysis);
    setIsFormOpen(false);
    setAnalysisRegistrationId(undefined);
    setEditingAnalysisId(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <Flame className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Получение молока</h2>
          <p className="text-sm text-text-muted">Контроль поступления молока и этапов приёмки</p>
        </div>
      </div>

      {/* Этап 1 БП: Анализ молока на соответствие качественным параметрам */}
      <section className="bg-surface rounded-xl border border-border overflow-hidden">
        {!canEditProduction && (
          <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Раздел доступен только для чтения. Редактирование и регистрация поступлений недоступны.
          </div>
        )}
        <div className="p-4 border-b border-border bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              {activeTab === 'registration' ? (
                <>
                  <h3 className="font-semibold text-text-primary">Регистрация поступления молока</h3>
                  <p className="text-sm text-text-muted">
                    Фиксация факта приёмки молока: поставщик, вид молока, объём в литрах и килограммах, документы.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-text-primary">Анализ поступающего молока</h3>
                  <p className="text-sm text-text-muted">
                    Проверка молока по ключевым показателям качества: температура, жирность, pH, белок и органолептика.
                  </p>
                </>
              )}
              <div className="mt-3 inline-flex rounded-lg border border-border bg-surface-secondary p-0.5 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('registration')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${
                    activeTab === 'registration'
                      ? 'bg-surface shadow-sm text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Регистрация
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${
                    activeTab === 'analysis'
                      ? 'bg-surface shadow-sm text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Анализ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === 'analysis' && (
            <>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-text-muted">Результаты анализов</span>
              </div>

              {isFormOpen && (
                <form
                  onSubmit={handleSubmit}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium text-text-primary">
                      {editingAnalysisId
                        ? 'Редактирование результата анализа'
                        : 'Новый результат анализа'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!editingAnalysisId}
                        title={
                          editingAnalysisId
                            ? 'Сбросить поля к последнему сохранённому варианту'
                            : 'Доступно при редактировании из карточки «Детали анализа»'
                        }
                        onClick={() => {
                          if (!editingAnalysisId) return;
                          const row = analyses.find((a) => a.id === editingAnalysisId);
                          if (!row) return;
                          setForm({
                            date: row.date,
                            batch: row.batch ?? '',
                            temperature: row.temperature,
                            fat: row.fat,
                            ph: row.ph,
                            protein: row.protein,
                            organoleptic: row.organoleptic,
                            passed: row.passed,
                          });
                          setAnalysisRegistrationId(row.registrationId);
                        }}
                        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingAnalysisId(undefined);
                          setAnalysisRegistrationId(undefined);
                          setForm(initialAnalysis);
                        }}
                        className="text-text-muted hover:text-text-primary text-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Дата (ДД.ММ.ГГГГ)</span>
                      <DateInputRu
                        value={form.date}
                        onChange={(iso: string) => setField('date', iso)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Номер партии</span>
                      <input
                        type="text"
                        value={form.batch}
                        onChange={(e) => setField('batch', e.target.value)}
                        placeholder="Необязательно"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Температура, °C</span>
                      <input
                        type="text"
                        value={form.temperature}
                        onChange={(e) => setField('temperature', e.target.value)}
                        placeholder="4–6"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Жирность, %</span>
                      <input
                        type="text"
                        value={form.fat}
                        onChange={(e) => setField('fat', e.target.value)}
                        placeholder="3,2"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">pH</span>
                      <input
                        type="text"
                        value={form.ph}
                        onChange={(e) => setField('ph', e.target.value)}
                        placeholder="6,6–6,8"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Белок, %</span>
                      <input
                        type="text"
                        value={form.protein}
                        onChange={(e) => setField('protein', e.target.value)}
                        placeholder="2,8–3,2"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-sm text-text-secondary">Органолептические свойства</span>
                      <input
                        type="text"
                        value={form.organoleptic}
                        onChange={(e) => setField('organoleptic', e.target.value)}
                        placeholder="цвет, запах, вкус, консистенция"
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.passed}
                      onChange={(e) => setField('passed', e.target.checked)}
                      className="rounded border-border text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-text-secondary">Соответствует нормативам</span>
                  </label>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <Check className="w-4 h-4" />
                      {editingAnalysisId ? 'Сохранить изменения' : 'Сохранить анализ'}
                    </button>
                  </div>
                </form>
              )}

              {analyses.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-secondary">
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Партия</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Температура</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Жирность</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">pH</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Белок</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Органолептика</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Соответствие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map((a) => (
                        <tr key={a.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                          <td className="py-2.5 px-4 text-text-primary">{formatDateRu(a.date)}</td>
                          <td className="py-2.5 px-4 text-text-primary">{a.batch || '—'}</td>
                          <td className="py-2.5 px-4 text-text-primary">{a.temperature || '—'}</td>
                          <td className="py-2.5 px-4 text-text-primary">{a.fat || '—'}</td>
                          <td className="py-2.5 px-4 text-text-primary">{a.ph || '—'}</td>
                          <td className="py-2.5 px-4 text-text-primary">{a.protein || '—'}</td>
                          <td className="py-2.5 px-4 text-text-primary max-w-[180px] truncate" title={a.organoleptic}>
                            {a.organoleptic || '—'}
                          </td>
                          <td className="py-2.5 px-4">
                            {a.passed ? (
                              <span className="inline-flex items-center gap-1 text-accent-600 text-xs font-medium">
                                <Check className="w-3.5 h-3.5" />
                                Да
                              </span>
                            ) : (
                              <span className="text-text-muted text-xs">Нет</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {analyses.length === 0 && !isFormOpen && (
                <p className="text-sm text-text-muted py-2">
                  Пока нет сохранённых результатов. Нажмите «Добавить анализ».
                </p>
              )}
            </>
          )}

          {activeTab === 'registration' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-text-muted">Зарегистрированные поступления молока</span>
                <button
                  type="button"
                  disabled={registrations.length === 0}
                  title={
                    registrations.length === 0
                      ? 'Нет строк для выгрузки'
                      : 'Скачать таблицу в Excel (.xlsx)'
                  }
                  onClick={() => downloadMilkRegistrationsExcel(registrations, analyses)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать
                </button>
              </div>

              {registrations.length === 0 ? (
                <div className="py-6 space-y-4">
                  <div className="text-sm text-text-muted">
                    <p className="mb-2">
                      Пока нет зарегистрированных поступлений. Ниже пример того, как может выглядеть одна запись:
                    </p>
                    <div className="inline-block rounded-lg border border-border bg-surface-secondary px-4 py-3 text-left text-xs text-text-secondary space-y-1">
                      <p>
                        <span className="font-semibold text-text-primary">Дата:</span>{' '}
                        {formatDateRu('2026-03-10')}
                      </p>
                      <p><span className="font-semibold text-text-primary">Поставщик:</span> МетаКом</p>
                      <p><span className="font-semibold text-text-primary">Вид молока:</span> коровье</p>
                      <p><span className="font-semibold text-text-primary">Кол-во, л / кг:</span> 1200 / 1236,00</p>
                      <p><span className="font-semibold text-text-primary">Сканы документов:</span> ТТН №123 от 10.03.2026</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-secondary">
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">№ рег.</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Дата</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Поставщик</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Вид молока</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Кол-во, л</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Кол-во, кг</th>
                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Сканы документов</th>
                        <th className="text-right py-3 px-4 font-medium text-text-secondary w-[1%]">Анализ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => {
                        const linkedAnalysis = r.analysisId
                          ? analyses.find((a) => a.id === r.analysisId)
                          : undefined;
                        return (
                          <tr
                            key={r.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setRegistrationToView(r)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setRegistrationToView(r);
                              }
                            }}
                            className="border-b border-border hover:bg-surface-hover transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-4 text-text-primary whitespace-nowrap font-mono text-xs">
                              {r.registrationNumber || '—'}
                            </td>
                            <td className="py-2.5 px-4 text-text-primary">{formatDateRu(r.date)}</td>
                            <td className="py-2.5 px-4 text-text-primary">{r.supplier || '—'}</td>
                            <td className="py-2.5 px-4 text-text-primary">{r.milkType || '—'}</td>
                            <td className="py-2.5 px-4 text-text-primary">{r.liters || '—'}</td>
                            <td className="py-2.5 px-4 text-text-primary">{r.kg || '—'}</td>
                            <td className="py-2.5 px-4 text-text-primary max-w-[220px] truncate" title={r.docsNote}>
                              {r.docsNote || '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              {linkedAnalysis ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAnalysisToView(linkedAnalysis);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-400 hover:bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors"
                                >
                                  Анализ
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canEditProduction}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!canEditProduction) return;
                                    setActiveTab('analysis');
                                    setIsFormOpen(true);
                                    setEditingAnalysisId(undefined);
                                    setAnalysisRegistrationId(r.id);
                                    setForm((prev) => ({
                                      ...prev,
                                      date: r.date || prev.date,
                                      batch: r.supplier
                                        ? `${r.supplier}${r.milkType ? `, ${r.milkType}` : ''}`
                                        : prev.batch,
                                    }));
                                  }}
                                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
                                >
                                  Анализ
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  disabled={!canEditProduction}
                  onClick={() => {
                    if (!canEditProduction) return;
                    setRegistrationAnalysisId(undefined);
                    setEditingRegistrationId(undefined);
                    resetRegistrationFormFields(registrations);
                    setIsRegistrationModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Зарегистрировать поступление
                </button>
              </div>
            </div>
          )}

          {isRegistrationModalOpen && canEditProduction && (
            <div className="fixed inset-y-0 left-[260px] right-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-border">
                  <h3 className="text-base font-semibold text-text-primary">
                    {editingRegistrationId
                      ? 'Редактирование поступления молока'
                      : 'Регистрация поступления молока'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!editingRegistrationId}
                      title={
                        editingRegistrationId
                          ? 'Вернуть значения из сохранённой записи'
                          : 'Откройте карточку поступления и нажмите «Редактировать»'
                      }
                      onClick={() => {
                        if (!editingRegistrationId) return;
                        const row = registrations.find((x) => x.id === editingRegistrationId);
                        if (row) loadRegistrationIntoForm(row);
                      }}
                      className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Редактировать
                    </button>
                    <button
                      type="button"
                      className="text-sm text-text-muted hover:text-text-primary"
                      onClick={() => {
                        setIsRegistrationModalOpen(false);
                        setEditingRegistrationId(undefined);
                        resetRegistrationFormFields(registrations);
                      }}
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
                <form
                  className="px-5 py-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingRegistrationId) {
                      const existing = registrations.find((r) => r.id === editingRegistrationId);
                      const regNum =
                        registrationNumber.trim() ||
                        existing?.registrationNumber ||
                        getNextRegistrationNumber(
                          registrations.filter((r) => r.id !== editingRegistrationId),
                        );
                      const nextRegs = registrations.map((r) =>
                        r.id === editingRegistrationId
                          ? {
                              ...r,
                              batchNumber: registrationBatchNumber,
                              registrationNumber: regNum,
                              date: registrationDate,
                              supplier: registrationSupplier,
                              milkType: registrationMilkType,
                              liters: registrationLiters,
                              kg: registrationKg,
                              docsNote: registrationDocsNote,
                            }
                          : r,
                      );
                      setRegistrations(nextRegs);
                      resetRegistrationFormFields(nextRegs);
                      setEditingRegistrationId(undefined);
                    } else {
                      const regNum =
                        registrationNumber.trim() || getNextRegistrationNumber(registrations);
                      const newItem: MilkRegistration = {
                        id: crypto.randomUUID(),
                        batchNumber: registrationBatchNumber,
                        registrationNumber: regNum,
                        date: registrationDate,
                        supplier: registrationSupplier,
                        milkType: registrationMilkType,
                        liters: registrationLiters,
                        kg: registrationKg,
                        docsNote: registrationDocsNote,
                        analysisId: registrationAnalysisId,
                      };
                      const nextRegs = [newItem, ...registrations];
                      setRegistrations(nextRegs);
                      resetRegistrationFormFields(nextRegs);
                    }
                    setIsRegistrationModalOpen(false);
                    setRegistrationAnalysisId(undefined);
                    setActiveTab('registration');
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Номер партии</span>
                      <input
                        type="text"
                        value={registrationBatchNumber}
                        onChange={(e) => setRegistrationBatchNumber(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Дата (ДД.ММ.ГГГГ)</span>
                      <DateInputRu
                        value={registrationDate}
                        onChange={setRegistrationDate}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Поставщик</span>
                      <select
                        value={registrationSupplier}
                        onChange={(e) => setRegistrationSupplier(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        <option value="">Выберите поставщика</option>
                        <option value="МетаКом">МетаКом</option>
                        <option value="Волга">Волга</option>
                        <option value="Волга + МетаКом">Волга + МетаКом</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Номер регистрации</span>
                      <p className="mt-0.5 text-xs text-text-muted leading-snug">
                        Внутренний учётный номер поступления в журнале приёмки; подставляется
                        автоматически (формат РМ-000001). При необходимости можно исправить вручную.
                      </p>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Вид молока</span>
                      <select
                        value={registrationMilkType}
                        onChange={(e) => setRegistrationMilkType(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      >
                        <option value="">Выберите вид молока</option>
                        <option value="коровье">коровье</option>
                        <option value="козье">козье</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Количество, литры</span>
                      <input
                        type="text"
                        value={registrationLiters}
                        onChange={(e) => handleLitersChange(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Количество, кг</span>
                      <input
                        type="text"
                        value={registrationKg}
                        onChange={(e) => handleKgChange(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="text-sm text-text-secondary">Сканы документов</span>
                      <input
                        type="text"
                        placeholder="ссылка или примечание"
                        value={registrationDocsNote}
                        onChange={(e) => setRegistrationDocsNote(e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistrationModalOpen(false);
                        setEditingRegistrationId(undefined);
                        resetRegistrationFormFields(registrations);
                      }}
                      className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-surface-secondary transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                    >
                      {editingRegistrationId ? 'Сохранить изменения' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {analysisToView && (
        <div className="fixed inset-y-0 left-[260px] right-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-text-primary">Детали анализа</h3>
              <button
                type="button"
                className="text-sm text-text-muted hover:text-text-primary"
                onClick={() => setAnalysisToView(null)}
              >
                Закрыть
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-text-secondary">Дата анализа</div>
                  <div className="font-medium text-text-primary">{formatDateRu(analysisToView.date)}</div>
                </div>
                <div>
                  <div className="text-text-secondary">Партия / поставка</div>
                  <div className="font-medium text-text-primary">{analysisToView.batch || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-text-secondary">Температура, °C</div>
                  <div className="font-medium text-text-primary">{analysisToView.temperature || '—'}</div>
                </div>
                <div>
                  <div className="text-text-secondary">Жирность, %</div>
                  <div className="font-medium text-text-primary">{analysisToView.fat || '—'}</div>
                </div>
                <div>
                  <div className="text-text-secondary">pH</div>
                  <div className="font-medium text-text-primary">{analysisToView.ph || '—'}</div>
                </div>
                <div>
                  <div className="text-text-secondary">Белок, %</div>
                  <div className="font-medium text-text-primary">{analysisToView.protein || '—'}</div>
                </div>
              </div>
              <div>
                <div className="text-text-secondary">Органолептические свойства</div>
                <div className="font-medium text-text-primary">
                  {analysisToView.organoleptic || '—'}
                </div>
              </div>
              <div>
                <div className="text-text-secondary">Соответствие нормативам</div>
                <div className="font-medium text-text-primary">
                  {analysisToView.passed ? 'Соответствует' : 'Не соответствует'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 px-5 py-3 border-t border-border">
              {canEditProduction && (
                <button
                  type="button"
                  onClick={() => {
                    const a = analysisToView;
                    setForm({
                      date: a.date,
                      batch: a.batch ?? '',
                      temperature: a.temperature,
                      fat: a.fat,
                      ph: a.ph,
                      protein: a.protein,
                      organoleptic: a.organoleptic,
                      passed: a.passed,
                    });
                    setEditingAnalysisId(a.id);
                    setAnalysisRegistrationId(a.registrationId);
                    setAnalysisToView(null);
                    setActiveTab('analysis');
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Редактировать
                </button>
              )}
              <button
                type="button"
                onClick={() => setAnalysisToView(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {registrationToView && (
        <div
          className="fixed inset-y-0 left-[260px] right-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-view-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3
                id="registration-view-title"
                className="text-base font-semibold text-text-primary"
              >
                Регистрация поступления
              </h3>
              <button
                type="button"
                className="text-sm text-text-muted hover:text-text-primary"
                onClick={() => setRegistrationToView(null)}
              >
                Закрыть
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-text-secondary">Номер регистрации</div>
                  <div className="font-medium text-text-primary font-mono text-xs">
                    {registrationToView.registrationNumber || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Номер партии</div>
                  <div className="font-medium text-text-primary">
                    {registrationToView.batchNumber || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Дата</div>
                  <div className="font-medium text-text-primary">
                    {formatDateRu(registrationToView.date)}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Поставщик</div>
                  <div className="font-medium text-text-primary">
                    {registrationToView.supplier || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Вид молока</div>
                  <div className="font-medium text-text-primary">
                    {registrationToView.milkType || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Количество, л / кг</div>
                  <div className="font-medium text-text-primary">
                    {[registrationToView.liters || '—', registrationToView.kg || '—'].join(' / ')}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-text-secondary">Сканы документов</div>
                <div className="font-medium text-text-primary break-words">
                  {registrationToView.docsNote || '—'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 px-5 py-3 border-t border-border">
              {(() => {
                const aid = registrationToView.analysisId;
                const regAnalysis = aid ? analyses.find((a) => a.id === aid) : undefined;
                return regAnalysis ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationToView(null);
                      setAnalysisToView(regAnalysis);
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                  >
                    Результаты анализа
                  </button>
                ) : null;
              })()}
              {canEditProduction && (
                <button
                  type="button"
                  onClick={() => {
                    loadRegistrationIntoForm(registrationToView);
                    setEditingRegistrationId(registrationToView.id);
                    setRegistrationToView(null);
                    setIsRegistrationModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Редактировать
                </button>
              )}
              <button
                type="button"
                onClick={() => setRegistrationToView(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
