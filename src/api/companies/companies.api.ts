import { api } from "@/api-config/axiosInstance";
import type {
  CompanyHistoryParams,
  CompanyHistoryResponse,
  ListCompaniesParams,
  ListCompaniesResponse,
} from "@/api/companies/companies.types";
import type { ApiEnvelope } from "@/types/api";

// Faqat o'qish.
export const companiesApi = {
  list: (params?: ListCompaniesParams): Promise<ListCompaniesResponse> =>
    api
      .get<ApiEnvelope<ListCompaniesResponse>>("/api/v1/dashboard/organizations", { params })
      .then((r) => r.data.data),

  /** Xarid va obuna voqealari, yangidan eskiga. */
  history: (params?: CompanyHistoryParams): Promise<CompanyHistoryResponse> =>
    api
      .get<ApiEnvelope<CompanyHistoryResponse>>("/api/v1/dashboard/organizations/history", { params })
      .then((r) => r.data.data),
};
