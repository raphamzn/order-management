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
  useClients,
  useCreateClient,
  useSetAuthorizedTransports,
  useUpdateClient,
} from "@/lib/api/clients";
import { useTransportTypes } from "@/lib/api/transports";
import type { Client } from "@/lib/api/types";
import { useAppDispatch } from "@/store/hooks";
import { notifyError, notifySuccess } from "@/store/ui.slice";

const schema = z.object({
  name: z.string().min(1, "Informe o nome"),
  document: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "E-mail inválido",
    ),
});
type FormValues = z.infer<typeof schema>;

function ClientForm({
  editing,
  onDone,
}: {
  editing: Client | null;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const transports = useTransportTypes();
  const create = useCreateClient();
  const update = useUpdateClient(editing?.id ?? "");
  const [authorized, setAuthorized] = useState<string[]>(
    editing?.authorizedTransportTypes.map((t) => t.id) ?? [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editing?.name ?? "",
      document: editing?.document ?? "",
      email: editing?.email ?? "",
    },
  });

  const toggle = (id: string) =>
    setAuthorized((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const submit = (values: FormValues) => {
    const payload = {
      name: values.name,
      document: values.document || undefined,
      email: values.email || undefined,
    };
    if (editing) {
      update.mutate(payload, {
        onSuccess: () => {
          dispatch(notifySuccess("Cliente atualizado"));
          onDone();
        },
        onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
      });
    } else {
      create.mutate(
        { ...payload, authorizedTransportTypeIds: authorized },
        {
          onSuccess: () => {
            dispatch(notifySuccess("Cliente criado"));
            onDone();
          },
          onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <Input label="Nome" error={errors.name?.message} {...register("name")} />
      <Input label="Documento (opcional)" {...register("document")} />
      <Input label="E-mail (opcional)" error={errors.email?.message} {...register("email")} />
      {!editing && (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Transportes autorizados
          </span>
          <div className="flex flex-col gap-1">
            {transports.data?.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={authorized.includes(t.id)}
                  onChange={() => toggle(t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
      </div>
    </form>
  );
}

function AuthorizationsForm({
  client,
  onDone,
}: {
  client: Client;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const transports = useTransportTypes();
  const mutation = useSetAuthorizedTransports(client.id);
  const [authorized, setAuthorized] = useState<string[]>(
    client.authorizedTransportTypes.map((t) => t.id),
  );

  const toggle = (id: string) =>
    setAuthorized((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const save = () =>
    mutation.mutate(authorized, {
      onSuccess: () => {
        dispatch(notifySuccess("Autorizações atualizadas"));
        onDone();
      },
      onError: (e) => dispatch(notifyError(apiErrorMessage(e))),
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {transports.data?.map((t) => (
          <label
            key={t.id}
            className="flex items-center gap-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={authorized.includes(t.id)}
              onChange={() => toggle(t.id)}
            />
            {t.name}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={mutation.isPending}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; client: Client }
  | { mode: "auth"; client: Client }
  | null;

export default function ClientesPage() {
  const { data, isLoading, isError, error } = useClients();
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Cadastro de clientes e transportes autorizados."
        actions={
          <Button onClick={() => setModal({ mode: "create" })}>
            Novo cliente
          </Button>
        }
      />
      <Card>
        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <ErrorState message={apiErrorMessage(error)} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Nenhum cliente cadastrado" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Transportes autorizados</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 text-slate-700">{client.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {client.document ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {client.authorizedTransportTypes.length === 0 ? (
                        <span className="text-slate-400">Nenhum</span>
                      ) : (
                        client.authorizedTransportTypes.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {t.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => setModal({ mode: "edit", client })}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setModal({ mode: "auth", client })}
                      >
                        Autorizações
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={modal !== null}
        title={
          modal?.mode === "auth"
            ? "Transportes autorizados"
            : modal?.mode === "edit"
              ? "Editar cliente"
              : "Novo cliente"
        }
        onClose={() => setModal(null)}
      >
        {modal?.mode === "auth" ? (
          <AuthorizationsForm client={modal.client} onDone={() => setModal(null)} />
        ) : (
          <ClientForm
            editing={modal?.mode === "edit" ? modal.client : null}
            onDone={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
