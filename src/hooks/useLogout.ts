import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";

/** Backend'da sessiya yo'q (token 24 soat) — lokal sessiya va kesh tozalanadi. */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((s) => s.clearSession);

  return () => {
    clearSession();
    queryClient.clear();
  };
}
