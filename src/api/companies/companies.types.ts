import type { Pagination } from "@/types/api";
import type {
  PlanDurationMonths,
  SubscriptionOrderPurpose,
  SubscriptionOrderStatus,
  SubscriptionStatus,
} from "@/types/domain";

/** qubnix `RawSubscriptionOrder` (swagger: `subscription/payments/{orderID}`) bilan bir xil. */
export interface RawSubscriptionOrder {
  id: string;
  organization_id: number | null;
  organization_name: string | null;
  purpose: SubscriptionOrderPurpose;
  plan_id: number;
  duration_months: PlanDurationMonths;
  /** so'm */
  amount: number;
  currency: "UZS";
  discount_percent: number;
  provider: "payme";
  status: SubscriptionOrderStatus;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
}

export interface CompanyOwner {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_username: string | null;
}

/**
 * Sotib olgan kompaniya: tashkilot + egasi + joriy obuna + to'lovlar yig'indisi.
 * Admin yo'li va shakl — taklif (swagger'da yo'q).
 */
export interface AdminCompanyRow {
  id: number;
  name: string;
  owner: CompanyOwner;
  plan_id: number;
  plan_name: string;
  status: SubscriptionStatus;
  starts_at: string;
  /** null — muddatsiz. */
  expires_at: string | null;
  members_count: number;
  orders_count: number;
  /** Faqat `paid` buyurtmalar yig'indisi, so'm. */
  total_paid: number;
  created_at: string;
}

export interface ListCompaniesParams {
  page?: number;
  limit?: number;
  /** Kompaniya nomi yoki ega ismi/telefoni. */
  search?: string;
  plan_id?: number;
  status?: SubscriptionStatus;
}

export interface ListCompaniesResponse {
  companies: AdminCompanyRow[];
  pagination: Pagination;
}
