/** Vaqt qatorlari qadami. Javobdagi `date` — qadam boshlanadigan kun (YYYY-MM-DD). */
export type Granularity = "day" | "week" | "month";

/**
 * Bitta ko'rsatkich: joriy qiymat va oldingi davr. `null` — hisoblab bo'lmaydi
 * yoki solishtirish yo'q.
 */
export interface KpiValue {
  value: number | null;
  previous: number | null;
}
