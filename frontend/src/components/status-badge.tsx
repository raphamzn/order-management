import { STATUS_LABEL, STATUS_STYLE } from "@/domain/order-status";
import type { OrderStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
