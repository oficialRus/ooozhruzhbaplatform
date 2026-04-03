import { useState, useEffect } from 'react';
import { formatDateRuPlain, parseFlexibleDateToIso, todayIsoLocal } from '@/utils/dateFormat';

type DateInputRuProps = {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** После ухода с поля с пустым вводом подставить сегодня (локальный календарь). */
  fillTodayOnEmptyBlur?: boolean;
};

/**
 * Дата в формате ДД.ММ.ГГГГ; наружу передаётся ГГГГ-ММ-ДД.
 */
export default function DateInputRu({
  id,
  value,
  onChange,
  className,
  disabled,
  required,
  placeholder = 'ДД.ММ.ГГГГ',
  fillTodayOnEmptyBlur = false,
}: DateInputRuProps) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(value ? formatDateRuPlain(value) : '');
    }
  }, [value, focused]);

  const shown = focused ? draft : value ? formatDateRuPlain(value) : '';

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={className}
      value={shown}
      title="День, месяц, год: ДД.ММ.ГГГГ"
      onFocus={() => {
        setFocused(true);
        setDraft(value ? formatDateRuPlain(value) : '');
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const t = draft.trim();
        if (!t) {
          if (fillTodayOnEmptyBlur) {
            onChange(todayIsoLocal());
          } else {
            onChange('');
          }
          return;
        }
        const parsed = parseFlexibleDateToIso(t);
        if (parsed) {
          onChange(parsed);
        } else {
          setDraft(value ? formatDateRuPlain(value) : '');
        }
      }}
    />
  );
}
