const ISO_DATE_FULL = /^(\d{4})-(\d{2})-(\d{2})$/;
const RU_DATE_INPUT = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;

function padDmYFromLocalDate(dt: Date): string {
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
}

/** Сегодняшний день по локальному времени в формате ГГГГ-ММ-ДД (внутреннее хранение). */
export function todayIsoLocal(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/**
 * ДД.ММ.ГГГГ из строки ГГГГ-ММ-ДД или пусто (для полей ввода).
 */
export function formatDateRuPlain(value: string | undefined | null): string {
  if (value == null || String(value).trim() === '') return '';
  const s = String(value).trim();
  const iso = s.match(ISO_DATE_FULL);
  if (iso) {
    const [, y, m, d] = iso;
    return `${d}.${m}.${y}`;
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    return padDmYFromLocalDate(new Date(t));
  }
  return '';
}

/**
 * Отображение: ДД.ММ.ГГГГ. Внутреннее хранение — ГГГГ-ММ-ДД.
 */
export function formatDateRu(value: string | undefined | null): string {
  if (value == null || String(value).trim() === '') return '—';
  const plain = formatDateRuPlain(value);
  return plain || '—';
}

/** Парсинг ДД.ММ.ГГГГ → ГГГГ-ММ-ДД */
export function parseRuDateToIso(text: string): string | null {
  const m = text.trim().match(RU_DATE_INPUT);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1000 || y > 9999) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Ввод: ДД.ММ.ГГГГ или ГГГГ-ММ-ДД → ГГГГ-ММ-ДД */
export function parseFlexibleDateToIso(text: string): string | null {
  const s = text.trim();
  if (!s) return null;
  const iso = s.match(ISO_DATE_FULL);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return parseRuDateToIso(s);
}

/** Для экспорта — пустая строка если даты нет. */
export function formatDateRuOrEmpty(value: string | undefined | null): string {
  if (value == null || String(value).trim() === '') return '';
  const plain = formatDateRuPlain(value);
  return plain;
}

/** «понедельник, 3 апреля» и т.п. для шапки (локаль ru). */
export function formatDateRuWeekdayDayMonth(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
}
