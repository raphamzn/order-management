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
import {
  useCreateTransportType,
  useTransportTypes,
  useUpdateTransportType,
} from "@/lib/api/transports";
import type { TransportType } from "@/lib/api/types";
import { useAppDispatch } from "@/store/hooks";
import { notifyError, notifySuccess } from "@/store/ui.slice";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  code: z.string().min(1, "Informe o código"),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function TransportForm({
  editing,
  onDone,
}: {
  editing: TransportType | null;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const create = useCreateTransportType();
  const update = useUpdateTransportType(editing?.id ?? "");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      code: editing?.code ?? "",
      active: editing?.active ?? true,
    },
  });

  const submit = (values: FormValues) => {
    const mutation = editing ? update : create;
    mutation.mutate(values, {
      onSuccess: () => {
        dispatch(notifySuccess(editing ? "Transporte atualizado" : "Transporte criado"));
        onDone();
      },
      onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input label="Nome" error={errors.name?.message} {...register("name")} />
      <Input label="Código" error={errors.code?.message} {...register("code")} />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" {...register("active")} /> Ativo
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
      </div>
    </form>
  );
}

export default function TransportesPage() {
  const { data, isLoading, isError, error } = useTransportTypes();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TransportType | null>(null);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (t: TransportType) => {
    setEditing(t);
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Tipos de Transporte"
        subtitle="Modalidades de transporte disponíveis para as ordens."
        actions={<Button onClick={openCreate}>Novo tipo</Button>}
      />
      <Card>
        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorState message={apiErrorMessage(error)} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Nenhum tipo de transporte cadastrado" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{t.name}</td>
                  <td className="px-4 py-3 text-slate-500">{t.code}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {t.active ? "Ativo" : "Inativo"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" onClick={() => openEdit(t)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={open}
        title={editing ? "Editar tipo de transporte" : "Novo tipo de transporte"}
        onClose={() => setOpen(false)}
      >
        <TransportForm editing={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
