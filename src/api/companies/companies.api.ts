import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import { companiesMock } from "@/api/companies/companies.mock";
import type {
  ListCompaniesParams,
  ListCompaniesResponse,
  RawSubscriptionOrder,
} from "@/api/companies/companies.types";
import type { ApiEnvelope } from "@/types/api";

// Endpoint yo'llari — taklif (backend bilan hali kelishilmagan). Faqat o'qish.
export const companiesApi = {
  list: (params?: ListCompaniesParams): Promise<ListCompaniesResponse> =>
    USE_MOCK
      ? companiesMock.list(params)
      : api
          .get<ApiEnvelope<ListCompaniesResponse>>("/api/v1/admin/companies", { params })
          .then((r) => r.data.data),

  /** Kompaniyaning barcha to'lov buyurtmalari (yangidan eskiga). */
  orders: (companyId: number): Promise<RawSubscriptionOrder[]> =>
    USE_MOCK
      ? companiesMock.orders(companyId)
      : api
          .get<ApiEnvelope<{ orders: RawSubscriptionOrder[] }>>(`/api/v1/admin/companies/${companyId}/orders`)
          .then((r) => r.data.data.orders),
};
