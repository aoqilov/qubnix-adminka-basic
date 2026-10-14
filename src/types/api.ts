/** Backend hamma javobni shu qobiq ichida qaytaradi; so'rov tanasi esa `{ data: ... }` ichida. */
export interface ApiEnvelope<T> {
  statusCode: number;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type SortOrder = "asc" | "desc";

/** `from`/`to` — YYYY-MM-DD, Asia/Tashkent kalendar kuni, ikkala chet ham kiradi. */
export interface DateRangeParams {
  from: string;
  to: string;
}
