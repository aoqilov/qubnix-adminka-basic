import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import { useDashboard } from "./hooks/useApiDashboard";
import { RevenueChart } from "./components/RevenueChart";
import { NewUsersChart } from "./components/NewUsersChart";
import { PlanShareCard } from "./components/PlanShareCard";
import { RecentOrdersCard } from "./components/RecentOrdersCard";

export default function FeatureDashboard() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const query = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <CusPageTitle className="" title={t("sections.dashboard.title")} subtitle={t("sections.dashboard.subtitle")} />

      <QueryBoundary query={query}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <section className="grid grid-cols-4 gap-4">
              <KpiTile label={t("sections.dashboard.kpi.users")} kpi={data.kpis.users_total} format={fmt.number} />
              <KpiTile
                label={t("sections.dashboard.kpi.companies")}
                kpi={data.kpis.companies_total}
                format={fmt.number}
              />
              <KpiTile
                label={t("sections.dashboard.kpi.active")}
                kpi={data.kpis.active_subscriptions}
                format={fmt.number}
              />
              <KpiTile
                label={t("sections.dashboard.kpi.revenue")}
                kpi={data.kpis.revenue_month}
                format={fmt.moneyCompact}
              />
            </section>

            <section className="grid grid-cols-2 gap-4">
              <RevenueChart data={data.revenue_series} />
              <NewUsersChart data={data.users_series} />
            </section>

            <section className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
              <PlanShareCard rows={data.plan_share} />
              <RecentOrdersCard rows={data.recent_orders} />
            </section>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
