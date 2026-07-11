"use client";

import { ORDER_FLOW, STATUS_LABEL } from "@/domain/order-status";
import { useClients } from "@/lib/api/clients";
import { useTransportTypes } from "@/lib/api/transports";
import type { OrderFilters as Filters } from "@/lib/api/types";
import { filterSet, filtersReset } from "@/store/filters.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export function OrderFilters() {
  const filters = useAppSelector((s) => s.filters);
  const dispatch = useAppDispatch();
  const clients = useClients();
  const transports = useTransportTypes();

  const setValue = (key: keyof Filters, value?: string) =>
    dispatch(filterSet({ key, value: value || undefined }));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select
        label="Status"
        value={filters.status ?? ""}
        onChange={(e) => setValue("status", e.target.value)}
      >
        <option value="">Todos</option>
        {ORDER_FLOW.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </Select>

      <Select
        label="Cliente"
        value={filters.clientId ?? ""}
        onChange={(e) => setValue("clientId", e.target.value)}
      >
        <option value="">Todos</option>
        {clients.data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        label="Transporte"
        value={filters.transportTypeId ?? ""}
        onChange={(e) => setValue("transportTypeId", e.target.value)}
      >
        <option value="">Todos</option>
        {transports.data?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>

      <Input
        label="Criada de"
        type="date"
        value={filters.dateFrom?.slice(0, 10) ?? ""}
        onChange={(e) =>
          setValue(
            "dateFrom",
            e.target.value ? new Date(e.target.value).toISOString() : undefined,
          )
        }
      />
      <Input
        label="Criada até"
        type="date"
        value={filters.dateTo?.slice(0, 10) ?? ""}
        onChange={(e) =>
          setValue(
            "dateTo",
            e.target.value
              ? new Date(`${e.target.value}T23:59:59`).toISOString()
              : undefined,
          )
        }
      />

      <div className="sm:col-span-2 lg:col-span-5">
        <Button variant="secondary" onClick={() => dispatch(filtersReset())}>
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
