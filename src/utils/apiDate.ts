/** YYYY-MM-DD — backend `from`/`to` parametrlari uchun, mahalliy (local) sana bo'yicha. */
export function toApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayApiDate(): string {
  return toApiDate(new Date());
}

/** Backend statistikasi Asia/Tashkent kalendar kunlarida ishlaydi — "bugun" ham shu zonada olinadi. */
export function tashkentTodayApiDate(): string {
  // en-CA formati — YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** `value` oyidan `offset` oy oldingi oyning 1-kuni (YYYY-MM-01). */
export function monthStartApiDate(value: string, offset = 0): string {
  const date = fromApiDate(value);
  return toApiDate(new Date(date.getFullYear(), date.getMonth() - offset, 1));
}

/** `YYYY-MM-DD` -> mahalliy (local) Date. `new Date(string)` ishlatilmaydi — u UTC deb o'qib, ba'zi zonalarda kunni bir kunga surib yuboradi. */
export function fromApiDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** `YYYY-MM-DD` ga `days` kun qo'shadi (manfiy — ayiradi). */
export function addApiDays(value: string, days: number): string {
  const date = fromApiDate(value);
  date.setDate(date.getDate() + days);
  return toApiDate(date);
}

/** Ikki sana orasidagi kunlar soni, ikkala chet ham hisobga olinadi: (d, d) → 1. */
export function daysInclusive(from: string, to: string): number {
  const ms = fromApiDate(to).getTime() - fromApiDate(from).getTime();
  // Yozgi/qishki vaqt o'tishida sutka 23/25 soat bo'lishi mumkin — yaxlitlanadi.
  return Math.round(ms / 86_400_000) + 1;
}
