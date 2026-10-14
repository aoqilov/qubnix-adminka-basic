import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/api/companies/companies.api";
import type { CompanyHistoryParams, ListCompaniesParams } from "@/api/companies/companies.types";

export const COMPANIES_KEYS = {
  list: (params: ListCompaniesParams) => ["companies", "list", params] as const,
  history: (params: CompanyHistoryParams) => ["companies", "history", params] as const,
};

export function useCompanies(params: ListCompaniesParams) {
  return useQuery({
    queryKey: COMPANIES_KEYS.list(params),
    queryFn: () => companiesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** `companyId` null bo'lsa so'rov ketmaydi (drawer yopiq). */
export function useCompanyHistory(companyId: string | null, page: number, limit: number) {
  const params: CompanyHistoryParams = { organization_id: companyId ?? undefined, page, limit };
  return useQuery({
    queryKey: COMPANIES_KEYS.history(params),
    queryFn: () => companiesApi.history(params),
    // keepPreviousData yo'q — boshqa kompaniya ochilganda oldingisining voqealari ko'rinmasin.
    enabled: companyId !== null,
  });
}
