import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { api } from "./client";
import type { Client } from "./types";

export interface CreateClientInput {
  name: string;
  document?: string;
  email?: string;
  authorizedTransportTypeIds?: string[];
}

export type UpdateClientInput = Partial<
  Pick<CreateClientInput, "name" | "document" | "email">
>;

export async function fetchClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>("/clients");
  return data;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const { data } = await api.post<Client>("/clients", input);
  return data;
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  const { data } = await api.patch<Client>(`/clients/${id}`, input);
  return data;
}

export async function setAuthorizedTransports(
  id: string,
  transportTypeIds: string[],
): Promise<Client> {
  const { data } = await api.put<Client>(`/clients/${id}/authorized-transports`, {
    transportTypeIds,
  });
  return data;
}

export function useClients() {
  return useQuery({ queryKey: queryKeys.clients.all, queryFn: fetchClients });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClientInput) => updateClient(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
  });
}

export function useSetAuthorizedTransports(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transportTypeIds: string[]) =>
      setAuthorizedTransports(id, transportTypeIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all }),
  });
}
