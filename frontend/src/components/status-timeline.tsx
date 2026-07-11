import { ORDER_FLOW, STATUS_LABEL } from "@/domain/order-status";
import type { OrderStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {ORDER_FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        return (
          <li key={step} className="flex items-center">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                reached ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "ml-2 text-xs",
                reached ? "font-medium text-slate-900" : "text-slate-400",
              )}
            >
              {STATUS_LABEL[step]}
            </span>
            {index < ORDER_FLOW.length - 1 && (
              <span className="mx-3 h-px w-6 bg-slate-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
