"use client";

import { useState } from "react";
import { ScheduleForm } from "@/components/orders/schedule-form";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingBlock } from "@/components/ui/spinner";
import { isMutable } from "@/domain/order-status";
import { apiErrorMessage } from "@/lib/api/client";
import { useOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { scheduleConfirmRequested } from "@/store/sagas/order.actions";

export default function AgendamentoPage() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, error } = useOrders({});
  const [selected, setSelected] = useState<Order | null>(null);

  const schedulable = data?.data.filter((o) => isMutable(o.status)) ?? [];

  return (
    <div>
      <PageHeader
        title="Central de Agendamento"
        subtitle="Defina data e janela de entrega, confirme e reagende as Ordens de Venda."
      />

      <Card>
        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorState message={apiErrorMessage(error)} />
        ) : schedulable.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem aguardando agendamento"
            description="Ordens em transporte ou entregues não aparecem aqui."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">OV</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Entrega</th>
                  <th className="px-4 py-3 font-medium">Agendamento</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {schedulable.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.code}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.schedule
                        ? `${formatDate(order.schedule.deliveryDate)} - ${order.schedule.windowStart}-${order.schedule.windowEnd}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.schedule?.status ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setSelected(order)}
                        >
                          {order.schedule ? "Reagendar" : "Agendar"}
                        </Button>
                        {order.schedule?.status === "PENDENTE" && (
                          <Button
                            onClick={() =>
                              dispatch(
                                scheduleConfirmRequested({
                                  orderId: order.id,
                                  currentStatus: order.status,
                                }),
                              )
                            }
                          >
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected?.schedule ? "Reagendar entrega" : "Agendar entrega"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <ScheduleForm
            orderId={selected.id}
            schedule={selected.schedule}
            onDone={() => setSelected(null)}
          />
        )}
      </Modal>
    </div>
  );
}
