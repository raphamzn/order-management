import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { api } from "./client";
import type { Item } from "./types";

export interface CreateItemInput {
  sku: string;
  name: string;
  unit?: string;
}

export async function fetchItems(): Promise<Item[]> {
  const { data } = await api.get<Item[]>("/items");
  return data;
}

export async function createItem(input: CreateItemInput): Promise<Item> {
  const { data } = await api.post<Item>("/items", input);
  return data;
}

export function useItems() {
  return useQuery({ queryKey: queryKeys.items.all, queryFn: fetchItems });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items.all }),
  });
}
