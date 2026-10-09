import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusInput } from "@/components/ui/inputs/CusInput";
import CusSelect from "@/components/ui/select/CusSelect";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { SubscriptionStatusBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/types/domain";
import type { AdminCompanyRow } from "@/api/companies/companies.types";
import { usePlans } from "@/widgets/features/tariffs/hooks/useApiTariffs";
import { useCompanies } from "./hooks/useApiCompanies";
import { CompanyOrdersDrawer } from "./modals/CompanyOrdersDrawer";

const PAGE_SIZE = 20;
/** CusSelect bo sh qiymat bilan "hammasi" tanlovini ifodalaydi (number | string talab qilinadi). */
const ALL = "all";

export default function FeatureCompanies() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [search, setSearch] = useState("");
  const [planId, setPlanId] = useState<number | typeof ALL>(ALL);
  const [status, setStatus] = useState<SubscriptionStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminCompanyRow | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const plansQuery = usePlans();
  const query = useCompanies({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    plan_id: planId === ALL ? undefined : planId,
    status: status === ALL ? undefined : status,
  });
  const companies = query.data?.companies ?? [];
  const total = query.data?.pagination.total ?? 0;

  const planOptions = [
    { label: t("sections.companies.filters.allPlans"), value: ALL as number | typeof ALL },
    ...(plansQuery.data ?? [])
      .filter((plan) => !plan.is_free)
      .map((plan) => ({ label: plan.name, value: plan.id as number | typeof ALL })),
  ];
  const statusOptions = [
    { label: t("sections.companies.filters.allStatuses"), value: ALL as SubscriptionStatus | typeof ALL },
    ...SUBSCRIPTION_STATUSES.map((value) => ({
      label: t(`domain.subscriptionStatus.${value}`),
      value: value as SubscriptionStatus | typeof ALL,
    })),
  ];

  const columns: ColumnDef<AdminCompanyRow>[] = [
    {
      key: "company",
      header: t("sections.companies.columns.company"),
      render: (row) => <span className="font-medium text-primary">{row.name}</span>,
    },
    {
      key: "owner",
      header: t("sections.companies.columns.owner"),
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-primary">{`${row.owner.first_name} ${row.owner.last_name}`}</span>
          <span className="text-xs text-secondary">{row.owner.phone_number}</span>
        </span>
      ),
    },
    { key: "plan", header: t("sections.companies.columns.plan"), render: (row) => row.plan_name },
    {
      key: "status",
      header: t("sections.companies.columns.status"),
      render: (row) => <SubscriptionStatusBadge status={row.status} />,
    },
    {
      key: "expires",
      header: t("sections.companies.columns.expires"),
      render: (row) => (row.expires_at ? fmt.isoDate(row.expires_at) : "—"),
    },
    {
      key: "members",
      header: t("sections.companies.columns.members"),
      align: "right",
      render: (row) => fmt.number(row.members_count),
    },
    {
      key: "paid",
      header: t("sections.companies.columns.paid"),
      align: "right",
      render: (row) => fmt.money(row.total_paid),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CusPageTitle
        className=""
        title={t("sections.companies.title")}
        subtitle={query.data ? t("sections.companies.total", { count: total }) : t("sections.companies.subtitle")}
      />

      <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-80">
            <CusInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t("sections.companies.search")}
              leftElement={<LuSearch size={16} />}
            leftElementWidth="2.5rem"
              clearable
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
            />
          </div>
          <div className="w-48">
            <CusSelect
              options={planOptions}
              value={planId}
              onChange={(value) => {
                setPlanId(value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-48">
            <CusSelect
              options={statusOptions}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <CusTable
          data={companies}
          columns={columns}
          interactive
          isLoading={query.isPending}
          emptyText={t("sections.companies.empty")}
          onRowClick={(row) => setSelected(row)}
        />

        {total > PAGE_SIZE && (
          <div className="flex justify-end">
            <CusPagination count={total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          </div>
        )}
      </CusCardbox>

      <CompanyOrdersDrawer company={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
