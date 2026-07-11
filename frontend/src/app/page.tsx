"use client";

import { OrderFilters } from "@/components/orders/order-filters";
import { OrdersTable } from "@/components/orders/orders-table";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingBlock } from "@/components/ui/spinner";
import { ORDER_FLOW, STATUS_LABEL } from "@/domain/order-status";
import { apiErrorMessage } from "@/lib/api/client";
import { useOrders } from "@/lib/api/orders";
import { useAppSelector } from "@/store/hooks";

export default function MonitoramentoPage() {
  const filters = useAppSelector((s) => s.filters);
  const all = useOrders({});
  const filtered = useOrders(filters);

  return (
    <div>
      <PageHeader
        title="Monitoramento operacional"
        subtitle="Acompanhe as Ordens de Venda por status, cliente, transporte e período."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ORDER_FLOW.map((status) => (
          <Card key={status} className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {STATUS_LABEL[status]}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {all.data?.data.filter((o) => o.status === status).length ?? 0}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 p-4">
        <OrderFilters />
      </Card>

      <Card>
        {filtered.isLoading ? (
          <LoadingBlock />
        ) : filtered.isError ? (
          <ErrorState message={apiErrorMessage(filtered.error)} />
        ) : !filtered.data || filtered.data.data.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem encontrada"
            description="Ajuste os filtros ou crie uma nova Ordem de Venda."
          />
        ) : (
          <OrdersTable orders={filtered.data.data} />
        )}
      </Card>
    </div>
  );
}
