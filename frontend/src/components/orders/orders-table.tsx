"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { Order } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-medium">OV</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Transporte</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Criada</th>
            <th className="px-4 py-3 font-medium">Entrega</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-800">
                {order.code}
              </td>
              <td className="px-4 py-3 text-slate-600">{order.client.name}</td>
              <td className="px-4 py-3 text-slate-600">
                {order.transportType.name}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {order.schedule ? formatDate(order.schedule.deliveryDate) : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/ordens/${order.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
