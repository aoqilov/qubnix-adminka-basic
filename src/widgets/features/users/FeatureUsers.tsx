import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusInput } from "@/components/ui/inputs/CusInput";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { avatarColorVar } from "@/utils/avatarColor";
import { useFormatters } from "@/utils/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ClientUser } from "@/api/users/users.types";
import { useUsers } from "./hooks/useApiUsers";

const PAGE_SIZE = 20;

export default function FeatureUsers() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const query = useUsers({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined });
  const users = query.data?.users ?? [];
  const total = query.data?.pagination.total ?? 0;

  const columns: ColumnDef<ClientUser>[] = [
    {
      key: "user",
      header: t("sections.users.columns.user"),
      render: (user) => (
        <span className="flex items-center gap-3">
          <span
            className="flex size-8 flex-none items-center justify-center rounded-avatar text-xs font-semibold text-on-brand"
            style={{ background: avatarColorVar(user.id) }}
          >
            {`${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()}
          </span>
          <span className="font-medium text-primary">{`${user.first_name} ${user.last_name}`}</span>
        </span>
      ),
    },
    { key: "phone", header: t("sections.users.columns.phone"), render: (user) => user.phone_number },
    {
      key: "telegram",
      header: t("sections.users.columns.telegram"),
      render: (user) => (user.telegram_username ? `@${user.telegram_username}` : "—"),
    },
    {
      key: "companies",
      header: t("sections.users.columns.companies"),
      align: "right",
      render: (user) => fmt.number(user.owned_organizations_count),
    },
    {
      key: "spent",
      header: t("sections.users.columns.spent"),
      align: "right",
      render: (user) => fmt.money(user.total_spent_uzs),
    },
    {
      key: "lastPayment",
      header: t("sections.users.columns.lastPayment"),
      render: (user) => (user.last_payment_at ? fmt.isoDate(user.last_payment_at) : "—"),
    },
    {
      key: "registered",
      header: t("sections.users.columns.registered"),
      render: (user) => fmt.isoDate(user.registered_at),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CusPageTitle
        className=""
        title={t("sections.users.title")}
        subtitle={query.data ? t("sections.users.total", { count: total }) : t("sections.users.subtitle")}
      />

      <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
        <div className="max-w-sm">
          <CusInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t("sections.users.search")}
            leftElement={<LuSearch size={16} />}
            leftElementWidth="2.5rem"
            clearable
            onClear={() => {
              setSearch("");
              setPage(1);
            }}
          />
        </div>

        <CusTable
          data={users}
          columns={columns}
          isLoading={query.isPending}
          emptyText={t("sections.users.empty")}
        />

        {total > PAGE_SIZE && (
          <div className="flex justify-end">
            <CusPagination count={total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          </div>
        )}
      </CusCardbox>
    </div>
  );
}
