import { MockApiError, mockDelay } from "@/api-config/mock";
import { getDb, paginate, toCompanyRow } from "@/mocks/db";
import type {
  AdminCompanyRow,
  ListCompaniesParams,
  ListCompaniesResponse,
  RawSubscriptionOrder,
} from "@/api/companies/companies.types";

const DEFAULT_LIMIT = 20;

export const companiesMock = {
  async list({
    page = 1,
    limit = DEFAULT_LIMIT,
    search,
    plan_id,
    status,
  }: ListCompaniesParams = {}): Promise<ListCompaniesResponse> {
    await mockDelay();
    const database = getDb();
    const query = search?.trim().toLowerCase();
    const rows = database.companies
      .map((company) => toCompanyRow(database, company))
      .filter(
        (row) =>
          (!query ||
            `${row.name} ${row.owner.first_name} ${row.owner.last_name} ${row.owner.phone_number}`
              .toLowerCase()
              .includes(query)) &&
          (plan_id === undefined || row.plan_id === plan_id) &&
          (status === undefined || row.status === status),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const { items, pagination } = paginate<AdminCompanyRow>(rows, page, limit);
    return { companies: items, pagination };
  },

  async orders(companyId: number): Promise<RawSubscriptionOrder[]> {
    await mockDelay();
    const database = getDb();
    if (!database.companies.some((company) => company.id === companyId)) {
      throw new MockApiError(404, "Компания не найдена");
    }
    return database.orders.filter((order) => order.organization_id === companyId).map((order) => ({ ...order }));
  },
};
