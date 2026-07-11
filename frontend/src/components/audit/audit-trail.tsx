"use client";

import { useAudit } from "@/lib/api/audit";
import type { AuditLog } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { LoadingBlock } from "../ui/spinner";
import { EmptyState } from "../ui/empty-state";

const ACTION_LABEL: Record<string, string> = {
  ORDER_CREATED: "Ordem de Venda criada",
  ORDER_STATUS_CHANGED: "Status alterado",
  ORDER_SCHEDULE_CHANGED: "Agendamento alterado",
  ORDER_TRANSPORT_CHANGED: "Transporte alterado",
};

function val(obj: Record<string, unknown> | null, key: string): string {
  const value = obj?.[key];
  return value == null ? "" : String(value);
}

function describe(log: AuditLog): string | null {
  const { previousState: prev, nextState: next } = log;
  if (log.action === "ORDER_STATUS_CHANGED") {
    return `${val(prev, "status")} -> ${val(next, "status")}`;
  }
  if (log.action === "ORDER_TRANSPORT_CHANGED") {
    return `${val(prev, "transportType")} -> ${val(next, "transportType")}`;
  }
  if (log.action === "ORDER_SCHEDULE_CHANGED" && next) {
    return `Entrega ${val(next, "deliveryDate")} (${val(next, "windowStart")}-${val(next, "windowEnd")}) - ${val(next, "status")}`;
  }
  return null;
}

export function AuditTrail({ orderId }: { orderId: string }) {
  const { data, isLoading, isError } = useAudit(orderId);

  if (isLoading) return <LoadingBlock label="Carregando auditoria..." />;
  if (isError || !data)
    return <EmptyState title="Não foi possível carregar a auditoria" />;
  if (data.data.length === 0)
    return <EmptyState title="Nenhum evento registrado" />;

  return (
    <ul className="flex flex-col gap-4">
      {data.data.map((log) => (
        <li key={log.id} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              {ACTION_LABEL[log.action] ?? log.action}
            </p>
            {describe(log) && (
              <p className="text-sm text-slate-500">{describe(log)}</p>
            )}
            <p className="text-xs text-slate-400">
              {formatDateTime(log.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
