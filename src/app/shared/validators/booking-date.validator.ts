import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface BookingDateErrors extends ValidationErrors {
  pastDate?: true;
  weekend?: true;
  summerClosure?: true;
  winterClosure?: true;
  holiday?: string;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const bookingDateValidator: ValidatorFn = (control: AbstractControl): BookingDateErrors | null => {
  const value: unknown = control.value;
  if (typeof value !== 'string' || value === '') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { invalidDate: true };

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const selectedDate = new Date(year, month - 1, day);
  if (
    selectedDate.getFullYear() !== year ||
    selectedDate.getMonth() !== month - 1 ||
    selectedDate.getDate() !== day
  ) {
    return { invalidDate: true };
  }

  if (value < formatLocalDate(new Date())) return { pastDate: true };

  const dayOfWeek = selectedDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return { weekend: true };

  const holidayName = getItalianNationalHoliday(year, value);
  if (holidayName) return { holiday: holidayName };

  if (month === 8 && day >= 16 && day <= 31) return { summerClosure: true };

  return month === 12 && day >= 24 && day <= 31 ? { winterClosure: true } : null;
};

function getItalianNationalHoliday(year: number, date: string): string | null {
  const fixedHolidays: Record<string, string> = {
    '01-01': 'Capodanno',
    '01-06': 'Epifania',
    '04-25': 'Festa della Liberazione',
    '05-01': 'Festa dei Lavoratori',
    '06-02': 'Festa della Repubblica',
    '08-15': 'Ferragosto',
    '11-01': 'Ognissanti',
    '12-08': 'Immacolata Concezione',
    '12-25': 'Natale',
    '12-26': 'Santo Stefano',
  };

  const monthAndDay = date.slice(5);
  if (fixedHolidays[monthAndDay]) return fixedHolidays[monthAndDay];

  return date === getEasterMonday(year) ? "Lunedì dell'Angelo" : null;
}

export function getEasterMonday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
  const easterMonday = new Date(year, easterMonth - 1, easterDay + 1);

  return formatLocalDate(easterMonday);
}
