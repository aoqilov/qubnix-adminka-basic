import axios from "axios";
import i18n from "@/i18n";

/** Backend xato javobi (swagger): `{ statusCode, message, code?, details? }`. */
interface ApiErrorBody {
  statusCode?: number;
  message?: string;
  code?: string;
}

/** Xato HTTP statusi; tarmoq xatosida (javob yo'q) — undefined. */
export function getApiErrorStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) return err.response?.status;
  return undefined;
}

/**
 * Backend `message` inglizcha keladi — foydalanuvchiga status bo'yicha ruscha matn ko'rsatiladi.
 * 400/409 da sabab muhim (masalan, tarif kompaniyalarda ishlatilmoqda) — backend matni qo'shib beriladi.
 */
export function getApiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(err)) return i18n.t("common.states.actionError");
  if (!err.response) return i18n.t("common.errors.network");

  const { status } = err.response;
  const detail = err.response.data?.message;
  const withDetail = (text: string) => (typeof detail === "string" && detail ? `${text}: ${detail}` : text);

  if (status === 400) return withDetail(i18n.t("common.errors.badRequest"));
  if (status === 403) return i18n.t("common.errors.forbidden");
  if (status === 404) return i18n.t("common.errors.notFound");
  if (status === 409) return withDetail(i18n.t("common.errors.conflict"));
  if (status === 429) return i18n.t("common.errors.tooManyRequests");
  if (status >= 500) return i18n.t("common.errors.server");
  return i18n.t("common.states.actionError");
}
