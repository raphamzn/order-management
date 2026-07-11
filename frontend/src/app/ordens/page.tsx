"use client";

import Link from "next/link";
import { OrdersTable } from "@/components/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingBlock } from "@/components/ui/spinner";
import { apiErrorMessage } from "@/lib/api/client";
import { useOrders } from "@/lib/api/orders";

export default function OrdensPage() {
  const { data, isLoading, isError, error } = useOrders({});

  return (
    <div>
      <PageHeader
        title="Ordens de Venda"
        subtitle="Todas as ordens registradas no sistema."
        actions={
          <Link href="/ordens/nova">
            <Button>Nova Ordem</Button>
          </Link>
        }
      />
      <Card>
        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorState message={apiErrorMessage(error)} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem cadastrada"
            description="Crie a primeira Ordem de Venda."
          />
        ) : (
          <OrdersTable orders={data.data} />
        )}
      </Card>
    </div>
  );
}
