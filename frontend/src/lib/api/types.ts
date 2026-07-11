export type OrderStatus =
  | "CRIADA"
  | "PLANEJADA"
  | "AGENDADA"
  | "EM_TRANSPORTE"
  | "ENTREGUE";

export type ScheduleStatus = "PENDENTE" | "CONFIRMADO";

export interface TransportType {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  unit?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  document?: string | null;
  email?: string | null;
  authorizedTransportTypes: TransportType[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Schedule {
  id: string;
  orderId: string;
  deliveryDate: string;
  windowStart: string;
  windowEnd: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  clientId: string;
  transportTypeId: string;
  client: Client;
  transportType: TransportType;
  items: OrderItem[];
  schedule: Schedule | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  previousState: Record<string, unknown> | null;
  nextState: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export interface OrderFilters {
  status?: OrderStatus;
  clientId?: string;
  transportTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}
