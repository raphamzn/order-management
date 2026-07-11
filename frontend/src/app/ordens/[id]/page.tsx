"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AuditTrail } from "@/components/audit/audit-trail";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { LoadingBlock } from "@/components/ui/spinner";
import { ScheduleForm } from "@/components/orders/schedule-form";
import { isMutable, nextStatus, STATUS_LABEL } from "@/domain/order-status";
import { apiErrorMessage } from "@/lib/api/client";
import { useChangeTransport, useOrder } from "@/lib/api/orders";
import { formatDate } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { orderStatusRequested, scheduleConfirmRequested } from "@/store/sagas/order.actions";
import { notifyError, notifySuccess } from "@/store/ui.slice";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const changeTransport = useChangeTransport(id);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [transportId, setTransportId] = useState("");

  if (isLoading) return <LoadingBlock />;
  if (isError || !order) return <ErrorState message={apiErrorMessage(error)} />;

  const mutable = isMutable(order.status);
  const next = nextStatus(order.status);
  const authorized = order.client.authorizedTransportTypes;

  const advance = () => {
    if (next) dispatch(orderStatusRequested({ orderId: order.id, to: next }));
  };

  const applyTransport = () => {
    if (!transportId || transportId === order.transportTypeId) return;
    changeTransport.mutate(transportId, {
      onSuccess: () => {
        dispatch(notifySuccess("Transporte alterado"));
        setTransportId("");
      },
      onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
    });
  };

  return (
    <div>
      <PageHeader
        title={`Ordem ${order.code}`}
        subtitle={`${order.client.name} - ${order.transportType.name}`}
        actions={<StatusBadge status={order.status} />}
      />

      <Card className="mb-6 p-5">
        <StatusTimeline status={order.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Itens</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 font-medium">SKU</th>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 text-right font-medium">Qtd.</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((line) => (
                  <tr key={line.id} className="border-t border-slate-100">
                    <td className="py-2 text-slate-600">{line.item.sku}</td>
                    <td className="py-2 text-slate-700">{line.item.name}</td>
                    <td className="py-2 text-right text-slate-700">
                      {line.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Agendamento
              </h2>
              {mutable && (
                <Button variant="secondary" onClick={() => setScheduleOpen(true)}>
                  {order.schedule ? "Reagendar" : "Agendar"}
                </Button>
              )}
            </div>
            {order.schedule ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-600">
                <span>
                  Entrega:{" "}
                  <strong className="text-slate-800">
                    {formatDate(order.schedule.deliveryDate)}
                  </strong>
                </span>
                <span>
                  Janela: {order.schedule.windowStart}-{order.schedule.windowEnd}
                </span>
                <span>
                  Situação:{" "}
                  <strong className="text-slate-800">
                    {order.schedule.status}
                  </strong>
                </span>
                {mutable && order.schedule.status === "PENDENTE" && (
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
                    Confirmar agendamento
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma entrega agendada para esta ordem.
              </p>
            )}
          </Card>

          {mutable && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Alterar transporte
              </h2>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-56 flex-1">
                  <Select
                    value={transportId}
                    onChange={(e) => setTransportId(e.target.value)}
                  >
                    <option value="">Selecione um transporte autorizado</option>
                    {authorized.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  variant="secondary"
                  disabled={
                    !transportId ||
                    transportId === order.transportTypeId ||
                    changeTransport.isPending
                  }
                  onClick={applyTransport}
                >
                  Alterar
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Fluxo</h2>
            {next ? (
              <Button className="w-full" onClick={advance}>
                Avançar para {STATUS_LABEL[next]}
              </Button>
            ) : (
              <p className="text-sm text-slate-500">
                A ordem chegou ao fim do fluxo operacional.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Auditoria
            </h2>
            <AuditTrail orderId={order.id} />
          </Card>
        </div>
      </div>

      <Modal
        open={scheduleOpen}
        title={order.schedule ? "Reagendar entrega" : "Agendar entrega"}
        onClose={() => setScheduleOpen(false)}
      >
        <ScheduleForm
          orderId={order.id}
          schedule={order.schedule}
          onDone={() => setScheduleOpen(false)}
        />
      </Modal>
    </div>
  );
}
