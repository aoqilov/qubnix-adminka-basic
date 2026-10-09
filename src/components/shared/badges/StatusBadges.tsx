import { useTranslation } from "react-i18next";
import { CusBadge, type BadgeTone } from "@/components/ui/badge/CusBadge";
import type { SubscriptionOrderStatus, SubscriptionStatus } from "@/types/domain";

const SUBSCRIPTION_TONE: Record<SubscriptionStatus, BadgeTone> = {
  active: "success",
  cancelled: "warning",
  expired: "error",
};

const ORDER_TONE: Record<SubscriptionOrderStatus, BadgeTone> = {
  paid: "success",
  pending: "warning",
  created: "neutral",
  cancelled: "neutral",
  failed: "error",
};

/** Holat rangi faqat nom bilan birga - rang yolg iz ma no tashimaydi. */
export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const { t } = useTranslation();
  return (
    <CusBadge tone={SUBSCRIPTION_TONE[status]} dot>
      {t(`domain.subscriptionStatus.${status}`)}
    </CusBadge>
  );
}

export function OrderStatusBadge({ status }: { status: SubscriptionOrderStatus }) {
  const { t } = useTranslation();
  return (
    <CusBadge tone={ORDER_TONE[status]} dot>
      {t(`domain.orderStatus.${status}`)}
    </CusBadge>
  );
}
