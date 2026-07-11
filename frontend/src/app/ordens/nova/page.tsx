"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { apiErrorMessage } from "@/lib/api/client";
import { useClients } from "@/lib/api/clients";
import { useItems } from "@/lib/api/items";
import { useCreateOrder } from "@/lib/api/orders";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  wizardClientSet,
  wizardItemAdded,
  wizardItemRemoved,
  wizardReset,
  wizardStepSet,
  wizardTransportSet,
} from "@/store/order-wizard.slice";
import { notifyError, notifySuccess } from "@/store/ui.slice";

const STEPS = ["Cliente", "Transporte", "Itens", "Revisão"];

export default function NovaOrdemPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wizard = useAppSelector((s) => s.orderWizard);

  const clients = useClients();
  const items = useItems();
  const createOrder = useCreateOrder();

  const selectedClient = clients.data?.find((c) => c.id === wizard.clientId);
  const authorizedTransports = selectedClient?.authorizedTransportTypes ?? [];

  const itemForm = useForm<{ itemId: string; quantity: number }>({
    defaultValues: { itemId: "", quantity: 1 },
  });

  const canAdvance =
    (wizard.step === 0 && Boolean(wizard.clientId)) ||
    (wizard.step === 1 && Boolean(wizard.transportTypeId)) ||
    (wizard.step === 2 && wizard.items.length > 0) ||
    wizard.step === 3;

  const submit = () => {
    if (!wizard.clientId || !wizard.transportTypeId) return;
    createOrder.mutate(
      {
        clientId: wizard.clientId,
        transportTypeId: wizard.transportTypeId,
        items: wizard.items,
      },
      {
        onSuccess: (order) => {
          dispatch(notifySuccess(`Ordem ${order.code} criada`));
          dispatch(wizardReset());
          router.push(`/ordens/${order.id}`);
        },
        onError: (error) => dispatch(notifyError(apiErrorMessage(error))),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Nova Ordem de Venda"
        subtitle="Cliente, transporte autorizado e itens."
      />

      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
              index === wizard.step
                ? "bg-indigo-600 text-white"
                : index < wizard.step
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-slate-100 text-slate-500",
            )}
          >
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <Card className="p-6">
        {wizard.step === 0 && (
          <div className="max-w-md">
            <Select
              label="Cliente"
              value={wizard.clientId ?? ""}
              onChange={(e) =>
                dispatch(wizardClientSet(e.target.value || undefined))
              }
            >
              <option value="">Selecione um cliente</option>
              {clients.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {wizard.step === 1 && (
          <div className="max-w-md">
            {authorizedTransports.length === 0 ? (
              <p className="text-sm text-slate-500">
                Este cliente não possui tipos de transporte autorizados. Cadastre
                as autorizações em Clientes antes de criar a ordem.
              </p>
            ) : (
              <Select
                label="Tipo de transporte autorizado"
                value={wizard.transportTypeId ?? ""}
                onChange={(e) =>
                  dispatch(wizardTransportSet(e.target.value || undefined))
                }
              >
                <option value="">Selecione o transporte</option>
                {authorizedTransports.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            )}
          </div>
        )}

        {wizard.step === 2 && (
          <div className="flex flex-col gap-5">
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={itemForm.handleSubmit((values) => {
                if (!values.itemId) return;
                dispatch(
                  wizardItemAdded({
                    itemId: values.itemId,
                    quantity: Number(values.quantity) || 1,
                  }),
                );
                itemForm.reset();
              })}
            >
              <div className="min-w-56 flex-1">
                <Select label="Item" {...itemForm.register("itemId")}>
                  <option value="">Selecione um item</option>
                  {items.data?.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.sku} - {i.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-28">
                <Input
                  label="Quantidade"
                  type="number"
                  min={1}
                  {...itemForm.register("quantity")}
                />
              </div>
              <Button type="submit" variant="secondary">
                Adicionar
              </Button>
            </form>

            {wizard.items.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum item adicionado.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {wizard.items.map((line) => {
                  const item = items.data?.find((i) => i.id === line.itemId);
                  return (
                    <li
                      key={line.itemId}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <span className="text-slate-700">
                        {item ? `${item.sku} - ${item.name}` : line.itemId}
                        <span className="ml-2 text-slate-400">
                          x {line.quantity}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        className="px-2 py-1 text-rose-600"
                        onClick={() => dispatch(wizardItemRemoved(line.itemId))}
                      >
                        Remover
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {wizard.step === 3 && (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Cliente</dt>
              <dd className="font-medium text-slate-800">
                {selectedClient?.name}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Transporte</dt>
              <dd className="font-medium text-slate-800">
                {
                  authorizedTransports.find(
                    (t) => t.id === wizard.transportTypeId,
                  )?.name
                }
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="mb-1 text-slate-400">Itens</dt>
              <dd>
                <ul className="list-inside list-disc text-slate-700">
                  {wizard.items.map((line) => {
                    const item = items.data?.find((i) => i.id === line.itemId);
                    return (
                      <li key={line.itemId}>
                        {item ? `${item.sku} - ${item.name}` : line.itemId} x{" "}
                        {line.quantity}
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          </dl>
        )}

        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
          <Button
            variant="secondary"
            disabled={wizard.step === 0}
            onClick={() => dispatch(wizardStepSet(wizard.step - 1))}
          >
            Voltar
          </Button>
          {wizard.step < 3 ? (
            <Button
              disabled={!canAdvance}
              onClick={() => dispatch(wizardStepSet(wizard.step + 1))}
            >
              Continuar
            </Button>
          ) : (
            <Button disabled={createOrder.isPending} onClick={submit}>
              Criar ordem
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
