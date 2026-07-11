import { createAction } from "@reduxjs/toolkit";
import type { OrderStatus } from "@/lib/api/types";

export const orderStatusRequested = createAction<{
  orderId: string;
  to: OrderStatus;
}>("order/statusRequested");

export const scheduleConfirmRequested = createAction<{
  orderId: string;
  currentStatus: OrderStatus;
}>("order/scheduleConfirmRequested");
