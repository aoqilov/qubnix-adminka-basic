import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/api/companies/companies.api";
import type { ListCompaniesParams } from "@/api/companies/companies.types";

export const COMPANIES_KEYS = {
  list: (params: ListCompaniesParams) => ["companies", "list", params] as const,
  orders: (companyId: number) => ["companies", "orders", companyId] as const,
};

export function useCompanies(params: ListCompaniesParams) {
  return useQuery({
    queryKey: COMPANIES_KEYS.list(params),
    queryFn: () => companiesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCompanyOrders(companyId: number | null) {
  return useQuery({
    queryKey: COMPANIES_KEYS.orders(companyId ?? 0),
    queryFn: () => companiesApi.orders(companyId as number),
    enabled: companyId !== null,
  });
}
