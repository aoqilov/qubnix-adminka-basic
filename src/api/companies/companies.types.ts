import type { Pagination, SortOrder } from "@/types/api";
import type { StatsDepth, SubscriptionOrderStatus, SubscriptionStatus } from "@/types/domain";

// swagger: /api/v1/dashboard/organizations*. Id'lar va so'm summalari string (katta son aniqligi).

export interface CompanyPerson {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_username: string | null;
  telegram_avatar_url: string | null;
  deleted_at: string | null;
}

export interface CompanySubscription {
  id: string;
  plan_id: number;
  plan_name: string | null;
  status: SubscriptionStatus;
  starts_at: string;
  /** null — muddatsiz. Javob uchun hisoblangan (bazani o'zgartirmaydi). */
  expires_at: string | null;
  is_active_paid: boolean;
  limits: {
    members: number | null;
    projects: number | null;
    routines: number | null;
    stats: StatsDepth | null;
  };
}

/** Jamoa kompaniyasi (personal workspace va o'chirilganlar ro'yxatga kirmaydi). */
export interface Company {
  id: string;
  name: string;
  owner_user_id: string;
  owner: CompanyPerson | null;
  created_at: string;
  deleted_at: string | null;
  purchased_at: string | null;
  last_payment_at: string | null;
  /** Bekor qilinganlarsiz, so'm; eski xaridlarda summa yozilmagan bo'lsa — null. */
  total_paid_uzs: string | null;
  members_count: number;
  projects_count: number;
  tasks_count: number;
  subscription: CompanySubscription | null;
}

export type CompaniesSortBy =
  | "created_at"
  | "name"
  | "purchased_at"
  | "subscription_expires_at"
  | "last_payment_at"
  | "total_paid_uzs"
  | "members_count"
  | "projects_count"
  | "tasks_count";

export interface ListCompaniesParams {
  page?: number;
  /** 1..100, standart 20. */
  limit?: number;
  /** Kompaniya yoki ega nomi, telefon, username, id. */
  search?: string;
  sort_by?: CompaniesSortBy;
  sort_order?: SortOrder;
}

export interface ListCompaniesResponse {
  organizations: Company[];
  pagination: Pagination;
}

export type CompanyEventType =
  | "organization_purchased"
  | "subscription_renewed"
  | "plan_changed"
  | "payment_cancelled";

export interface CompanyEventPlan {
  id: number;
  /** Tarifning hozirgi nomi. */
  name: string | null;
}

/** Xarid/obuna tarixidagi bitta voqea. To'lanib keyin bekor qilingan buyurtmada ikkala voqea ham bor. */
export interface CompanyHistoryEvent {
  id: string;
  type: CompanyEventType;
  occurred_at: string;
  organization: { id: string; name: string; deleted_at: string | null };
  purchaser: CompanyPerson | null;
  source: "payment_order" | "organization_purchase";
  source_id: string;
  order_id: string | null;
  provider: string;
  payment_status: SubscriptionOrderStatus | null;
  was_paid: boolean;
  plan: CompanyEventPlan | null;
  previous_plan: CompanyEventPlan | null;
  duration_months: number | null;
  /** so'm; yozilmagan bo'lsa — null. */
  amount_uzs: string | null;
  discount_percent: number | null;
  currency: "UZS";
  period_starts_at: string | null;
  period_expires_at: string | null;
}

export interface CompanyHistoryParams {
  page?: number;
  /** 1..100, standart 20. */
  limit?: number;
  /** Berilmasa — barcha kompaniyalar voqealari (arxivdagilari ham). */
  organization_id?: string;
}

export interface CompanyHistoryResponse {
  /** Yangidan eskiga. */
  events: CompanyHistoryEvent[];
  pagination: Pagination;
}
