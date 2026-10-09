import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users/users.api";
import type { ListUsersParams } from "@/api/users/users.types";

export const USERS_KEYS = {
  list: (params: ListUsersParams) => ["users", "list", params] as const,
};

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: USERS_KEYS.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}
