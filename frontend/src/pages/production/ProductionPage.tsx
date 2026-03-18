import { useState } from 'react';
import { Flame, Beaker, Plus, Check } from 'lucide-react';

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
  date: string;
  supplier: string;
  milkType: string;
  liters: string;
  kg: string;
  docsNote: string;
  analysisId?: string;
}

const MILK_DENSITY_KG_PER_L: number = 1.03;

const initialAnalysis: Omit<MilkQualityAnalysis, 'id'> = {
  date: new Date().toISOString().slice(0, 10),
  batch: '',
  temperature: '',
  fat: '',
  ph: '',
  protein: '',
  organoleptic: '',
  passed: false,
};

export default function ProductionPage() {
  const [analyses, setAnalyses] = useState<MilkQualityAnalysis[]>([]);
  const [registrations, setRegistrations] = useState<MilkRegistration[]>([]);
  const [form, setForm] = useState(initialAnalysis);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'registration'>('registration');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationAnalysisId, setRegistrationAnalysisId] = useState<string | undefined>(undefined);
  const [analysisRegistrationId, setAnalysisRegistrationId] = useState<string | undefined>(undefined);
  const [analysisToView, setAnalysisToView] = useState<MilkQualityAnalysis | null>(null);

  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().slice(0, 10));
  const [registrationSupplier, setRegistrationSupplier] = useState('');
  const [registrationMilkType, setRegistrationMilkType] = useState('');
  const [registrationLiters, setRegistrationLiters] = useState('');
  const [registrationKg, setRegistrationKg] = useState('');
  const [registrationDocsNote, setRegistrationDocsNote] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnalysis: MilkQualityAnalysis = {
      ...form,
      id: crypto.randomUUID(),
      registrationId: analysisRegistrationId,
    };
    setAnalyses((prev) => [newAnalysis, ...prev]);
    if (analysisRegistrationId) {
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === analysisRegistrationId
            ? { ...r, analysisId: newAnalysis.id }
            : r
        ),
      );
    }
    setForm(initialAnalysis);
    setIsFormOpen(false);
    setAnalysisRegistrationId(undefined);
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary">Новый результат анализа</h4>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-text-muted hover:text-text-primary text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Дата</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setField('date', e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-text-secondary">Партия / поставка</span>
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
                      Сохранить анализ
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
                          <td className="py-2.5 px-4 text-text-primary">{a.date}</td>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Зарегистрированные поступления молока</span>
              </div>

              {registrations.length === 0 ? (
                <div className="py-6 space-y-4">
                  <div className="text-sm text-text-muted">
                    <p className="mb-2">
                      Пока нет зарегистрированных поступлений. Ниже пример того, как может выглядеть одна запись:
                    </p>
                    <div className="inline-block rounded-lg border border-border bg-surface-secondary px-4 py-3 text-left text-xs text-text-secondary space-y-1">
                      <p><span className="font-semibold text-text-primary">Дата:</span> 2026-03-10</p>
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
                          <tr key={r.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                            <td className="py-2.5 px-4 text-text-primary">{r.date}</td>
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
                                  onClick={() => setAnalysisToView(linkedAnalysis)}
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-400 hover:bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-sm transition-colors"
                                >
                                  Анализ
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('analysis');
                                    setIsFormOpen(true);
                                    setAnalysisRegistrationId(r.id);
                                    setForm((prev) => ({
                                      ...prev,
                                      date: r.date || prev.date,
                                      batch: r.supplier
                                        ? `${r.supplier}${r.milkType ? `, ${r.milkType}` : ''}`
                                        : prev.batch,
                                    }));
                                  }}
                                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
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
                  onClick={() => {
                    setIsRegistrationModalOpen(true);
                    setRegistrationAnalysisId(undefined);
                  }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Зарегистрировать поступление
                </button>
              </div>
            </div>
          )}

          {isRegistrationModalOpen && (
            <div className="fixed inset-y-0 left-[260px] right-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-base font-semibold text-text-primary">Регистрация поступления молока</h3>
                  <button
                    type="button"
                    className="text-sm text-text-muted hover:text-text-primary"
                    onClick={() => setIsRegistrationModalOpen(false)}
                  >
                    Закрыть
                  </button>
                </div>
                <form
                  className="px-5 py-4 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRegistrations((prev) => [
                      {
                        id: crypto.randomUUID(),
                        date: registrationDate,
                        supplier: registrationSupplier,
                        milkType: registrationMilkType,
                        liters: registrationLiters,
                        kg: registrationKg,
                        docsNote: registrationDocsNote,
                        analysisId: registrationAnalysisId,
                      },
                      ...prev,
                    ]);
                    setIsRegistrationModalOpen(false);
                    setRegistrationAnalysisId(undefined);
                    setActiveTab('registration');
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-text-secondary">Дата</span>
                      <input
                        type="date"
                        value={registrationDate}
                        onChange={(e) => setRegistrationDate(e.target.value)}
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
                      onClick={() => setIsRegistrationModalOpen(false)}
                      className="px-4 py-2 text-sm rounded-lg border border-border text-text-secondary hover:bg-surface-secondary transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                    >
                      Сохранить
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
                  <div className="font-medium text-text-primary">{analysisToView.date || '—'}</div>
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
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-border">
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
    </div>
  );
}
