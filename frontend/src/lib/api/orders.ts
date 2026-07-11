import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query/keys";
import { api } from "./client";
import type { Order, OrderFilters, OrderStatus, Paginated } from "./types";

export interface CreateOrderInput {
  clientId: string;
  transportTypeId: string;
  items: { itemId: string; quantity: number }[];
}

export interface ScheduleInput {
  deliveryDate: string;
  windowStart: string;
  windowEnd: string;
}

export async function fetchOrders(
  filters: OrderFilters,
  page = 1,
): Promise<Paginated<Order>> {
  const { data } = await api.get<Paginated<Order>>("/orders", {
    params: { ...filters, page, pageSize: 50 },
  });
  return data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await api.post<Order>("/orders", input);
  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}

export async function changeOrderTransport(
  id: string,
  transportTypeId: string,
): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/${id}/transport`, {
    transportTypeId,
  });
  return data;
}

export async function scheduleOrder(id: string, input: ScheduleInput) {
  const { data } = await api.put(`/orders/${id}/schedule`, input);
  return data;
}

export async function confirmSchedule(id: string) {
  const { data } = await api.post(`/orders/${id}/schedule/confirm`);
  return data;
}

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: [...queryKeys.orders.all, filters],
    queryFn: () => fetchOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useChangeTransport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transportTypeId: string) =>
      changeOrderTransport(id, transportTypeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      qc.invalidateQueries({ queryKey: queryKeys.audit.all });
    },
  });
}

export function useScheduleOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleInput) => scheduleOrder(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all });
      qc.invalidateQueries({ queryKey: queryKeys.audit.all });
    },
  });
}
