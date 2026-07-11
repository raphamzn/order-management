import type { OrderStatus } from "@/lib/api/types";

export const ORDER_FLOW: OrderStatus[] = [
  "CRIADA",
  "PLANEJADA",
  "AGENDADA",
  "EM_TRANSPORTE",
  "ENTREGUE",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  CRIADA: "Criada",
  PLANEJADA: "Planejada",
  AGENDADA: "Agendada",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  CRIADA: "bg-slate-100 text-slate-600 ring-slate-200",
  PLANEJADA: "bg-sky-50 text-sky-700 ring-sky-200",
  AGENDADA: "bg-amber-50 text-amber-700 ring-amber-200",
  EM_TRANSPORTE: "bg-violet-50 text-violet-700 ring-violet-200",
  ENTREGUE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status);
  if (index < 0 || index >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

/** A OV ainda aceita (re)agendamento e troca de transporte antes de sair para entrega. */
export function isMutable(status: OrderStatus): boolean {
  return status !== "EM_TRANSPORTE" && status !== "ENTREGUE";
}
