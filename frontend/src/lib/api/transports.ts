import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { api } from "./client";
import type { TransportType } from "./types";

export interface CreateTransportInput {
  name: string;
  code: string;
  active?: boolean;
}

export async function fetchTransportTypes(): Promise<TransportType[]> {
  const { data } = await api.get<TransportType[]>("/transport-types");
  return data;
}

export async function createTransportType(
  input: CreateTransportInput,
): Promise<TransportType> {
  const { data } = await api.post<TransportType>("/transport-types", input);
  return data;
}

export async function updateTransportType(
  id: string,
  input: Partial<CreateTransportInput>,
): Promise<TransportType> {
  const { data } = await api.patch<TransportType>(`/transport-types/${id}`, input);
  return data;
}

export function useTransportTypes() {
  return useQuery({
    queryKey: queryKeys.transports.all,
    queryFn: fetchTransportTypes,
  });
}

export function useCreateTransportType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransportType,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transports.all }),
  });
}

export function useUpdateTransportType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateTransportInput>) =>
      updateTransportType(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transports.all }),
  });
}
