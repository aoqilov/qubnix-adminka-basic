import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { TimeSeriesChart } from "@/components/shared/charts/TimeSeriesChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import type { ColumnDef } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { UsersPoint } from "../hooks/useApiDashboard";

interface UsersRow extends UsersPoint {
  id: number;
}

/** Oylik yangi foydalanuvchilar: trend chizig i + "Таблица" ko rinishi. */
export function NewUsersChart({ data }: { data: UsersPoint[] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const rows: UsersRow[] = data.map((point, index) => ({ ...point, id: index }));

  const columns: ColumnDef<UsersRow>[] = [
    { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, "month") },
    {
      key: "new_users",
      header: t("sections.dashboard.newUsers.series"),
      align: "right",
      render: (row) => fmt.number(row.new_users),
    },
  ];

  return (
    <ChartCard
      title={t("sections.dashboard.newUsers.title")}
      subtitle={t("sections.dashboard.newUsers.subtitle")}
      table={{ columns, rows }}
    >
      <TimeSeriesChart
        data={data}
        granularity="month"
        series={[{ key: "new_users", label: t("sections.dashboard.newUsers.series"), color: SERIES_COLORS[0] }]}
        formatValue={fmt.number}
        formatAxis={fmt.number}
      />
    </ChartCard>
  );
}
