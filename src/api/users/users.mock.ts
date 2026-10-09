import { mockDelay } from "@/api-config/mock";
import { getDb, paginate } from "@/mocks/db";
import type { ListUsersParams, ListUsersResponse } from "@/api/users/users.types";

const DEFAULT_LIMIT = 20;

export const usersMock = {
  async list({ page = 1, limit = DEFAULT_LIMIT, search }: ListUsersParams = {}): Promise<ListUsersResponse> {
    await mockDelay();
    const query = search?.trim().toLowerCase();
    const filtered = getDb()
      .users.filter(
        (user) =>
          !query ||
          `${user.first_name} ${user.last_name} ${user.phone_number} ${user.telegram_username ?? ""}`
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) => b.registered_at.localeCompare(a.registered_at));
    const { items, pagination } = paginate(filtered, page, limit);
    return { users: items.map((user) => ({ ...user })), pagination };
  },
};
