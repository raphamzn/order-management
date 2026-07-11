"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingBlock } from "@/components/ui/spinner";
import { apiErrorMessage } from "@/lib/api/client";
import { useCreateItem, useItems } from "@/lib/api/items";
import { useAppDispatch } from "@/store/hooks";
import { notifyError, notifySuccess } from "@/store/ui.slice";

const schema = z.object({
  sku: z.string().min(1, "Informe o SKU"),
  name: z.string().min(1, "Informe o nome"),
  unit: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function ItemForm({ onDone }: { onDone: () => void }) {
  const dispatch = useAppDispatch();
  const create = useCreateItem();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sku: "", name: "", unit: "" },
  });

  const submit = (values: FormValues) =>
    create.mutate(
      { ...values, unit: values.unit || undefined },
      {
        onSuccess: () => {
          dispatch(notifySuccess("Item criado"));
          onDone();
        },
        onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
      },
    );

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input label="SKU" error={errors.sku?.message} {...register("sku")} />
      <Input label="Nome" error={errors.name?.message} {...register("name")} />
      <Input label="Unidade (opcional)" {...register("unit")} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit">Criar</Button>
      </div>
    </form>
  );
}

export default function ItensPage() {
  const { data, isLoading, isError, error } = useItems();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Itens"
        subtitle="Itens disponíveis para compor as Ordens de Venda."
        actions={<Button onClick={() => setOpen(true)}>Novo item</Button>}
      />
      <Card>
        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorState message={apiErrorMessage(error)} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Nenhum item cadastrado" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Unidade</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.unit ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} title="Novo item" onClose={() => setOpen(false)}>
        <ItemForm onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
