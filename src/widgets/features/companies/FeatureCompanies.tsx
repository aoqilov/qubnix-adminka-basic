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
import type { CompaniesSortBy, Company } from "@/api/companies/companies.types";
import type { SortOrder } from "@/types/api";
import { useCompanies } from "./hooks/useApiCompanies";
import { CompanyHistoryDrawer } from "./modals/CompanyHistoryDrawer";

const PAGE_SIZE = 20;

/** Backend tarif/status bo'yicha filtr bermaydi — o'rniga tayyor saralash variantlari. */
const SORTS = {
  newest: { sort_by: "created_at", sort_order: "desc" },
  lastPayment: { sort_by: "last_payment_at", sort_order: "desc" },
  paid: { sort_by: "total_paid_uzs", sort_order: "desc" },
  expires: { sort_by: "subscription_expires_at", sort_order: "asc" },
} satisfies Record<string, { sort_by: CompaniesSortBy; sort_order: SortOrder }>;
type SortKey = keyof typeof SORTS;
const SORT_KEYS = Object.keys(SORTS) as SortKey[];

export default function FeatureCompanies() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Company | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const query = useCompanies({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    ...SORTS[sort],
  });
  const companies = query.data?.organizations ?? [];
  const total = query.data?.pagination.total ?? 0;

  const sortOptions = SORT_KEYS.map((value) => ({ label: t(`sections.companies.sort.${value}`), value }));

  const columns: ColumnDef<Company>[] = [
    {
      key: "company",
      header: t("sections.companies.columns.company"),
      render: (row) => <span className="font-medium text-primary">{row.name}</span>,
    },
    {
      key: "owner",
      header: t("sections.companies.columns.owner"),
      render: (row) =>
        row.owner ? (
          <span className="flex flex-col">
            <span className="text-primary">{`${row.owner.first_name} ${row.owner.last_name}`}</span>
            <span className="text-xs text-secondary">{row.owner.phone_number}</span>
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "plan",
      header: t("sections.companies.columns.plan"),
      render: (row) => row.subscription?.plan_name ?? "—",
    },
    {
      key: "status",
      header: t("sections.companies.columns.status"),
      render: (row) => (row.subscription ? <SubscriptionStatusBadge status={row.subscription.status} /> : "—"),
    },
    {
      key: "expires",
      header: t("sections.companies.columns.expires"),
      render: (row) => (row.subscription?.expires_at ? fmt.isoDate(row.subscription.expires_at) : "—"),
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
      render: (row) => (row.total_paid_uzs === null ? "—" : fmt.money(row.total_paid_uzs)),
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
          <div className="w-56">
            <CusSelect
              options={sortOptions}
              value={sort}
              onChange={(value) => {
                setSort(value);
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

      <CompanyHistoryDrawer company={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
