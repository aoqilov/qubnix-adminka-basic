import { useTranslation } from "react-i18next";
import { CusDrawer } from "@/components/ui/dialog/CusDrawer";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { OrderStatusBadge, SubscriptionStatusBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import type { AdminCompanyRow, RawSubscriptionOrder } from "@/api/companies/companies.types";
import { usePlans } from "@/widgets/features/tariffs/hooks/useApiTariffs";
import { useCompanyOrders } from "../hooks/useApiCompanies";

type OrderRow = Omit<RawSubscriptionOrder, "id"> & { id: number };

interface CompanyOrdersDrawerProps {
  /** null — yopiq. */
  company: AdminCompanyRow | null;
  onClose: () => void;
}

/** Kompaniya tanlanganda: obuna xulosasi va barcha to lov buyurtmalari. */
export function CompanyOrdersDrawer({ company, onClose }: CompanyOrdersDrawerProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const ordersQuery = useCompanyOrders(company?.id ?? null);
  const plans = usePlans().data ?? [];
  const planName = (id: number) => plans.find((plan) => plan.id === id)?.name ?? "—";
  // CusTable qatorlari `id: number` talab qiladi; buyurtma id si uuid (string) — alohida raqam beriladi.
  const orders: OrderRow[] = (ordersQuery.data ?? []).map((order, index) => ({ ...order, id: index }));

  const columns: ColumnDef<OrderRow>[] = [
    { key: "date", header: t("sections.companies.orders.date"), render: (row) => fmt.isoDateTime(row.created_at) },
    {
      key: "purpose",
      header: t("sections.companies.orders.purpose"),
      render: (row) => t(`domain.orderPurpose.${row.purpose}`),
    },
    { key: "plan", header: t("sections.companies.orders.plan"), render: (row) => planName(row.plan_id) },
    {
      key: "period",
      header: t("sections.companies.orders.period"),
      render: (row) => t("domain.duration", { count: row.duration_months }),
    },
    {
      key: "amount",
      header: t("sections.companies.orders.amount"),
      align: "right",
      render: (row) => fmt.money(row.amount),
    },
    {
      key: "status",
      header: t("sections.companies.orders.status"),
      render: (row) => <OrderStatusBadge status={row.status} />,
    },
  ];

  return (
    <CusDrawer
      open={company !== null}
      onClose={onClose}
      placement="end"
      size="lg"
      title={company?.name ?? t("sections.companies.orders.title")}
    >
      <div className="flex flex-col gap-4">
        {company && (
          <div className="flex flex-wrap items-center gap-3">
            <SubscriptionStatusBadge status={company.status} />
            <span className="text-sm text-secondary">
              {t("sections.companies.orders.summary", { plan: company.plan_name, paid: fmt.money(company.total_paid) })}
            </span>
          </div>
        )}
        <CusTable
          data={orders}
          columns={columns}
          size="sm"
          isLoading={ordersQuery.isPending}
          emptyText={t("sections.companies.orders.empty")}
        />
      </div>
    </CusDrawer>
  );
}
