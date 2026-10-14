// qubnix domenining umumiy qiymatlari — API type'lari shularni ishlatadi (swagger bilan bir xil).

export type PlanDurationMonths = 1 | 3 | 6 | 12;
export const PLAN_DURATIONS: readonly PlanDurationMonths[] = [1, 3, 6, 12];

/** Statistika qancha orqaga ko'rinadi. */
export type StatsDepth = "today" | "3months" | "full";
export const STATS_DEPTHS: readonly StatsDepth[] = ["today", "3months", "full"];

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type SubscriptionOrderStatus = "created" | "pending" | "paid" | "cancelled" | "failed";
