import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { api } from "./client";
import type { AuditLog, Paginated } from "./types";

export async function fetchAudit(entityId?: string): Promise<Paginated<AuditLog>> {
  const { data } = await api.get<Paginated<AuditLog>>("/audit-logs", {
    params: { entityId, pageSize: 100 },
  });
  return data;
}

export function useAudit(entityId?: string) {
  return useQuery({
    queryKey: [...queryKeys.audit.all, entityId ?? "all"],
    queryFn: () => fetchAudit(entityId),
  });
}
