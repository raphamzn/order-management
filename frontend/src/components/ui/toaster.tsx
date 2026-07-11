"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toastDismissed } from "@/store/ui.slice";

const toneStyles: Record<string, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-slate-200 bg-white text-slate-700",
};

export function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(toastDismissed(t.id)), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "cursor-pointer rounded-lg border px-4 py-3 text-sm shadow-sm",
            toneStyles[t.type],
          )}
          onClick={() => dispatch(toastDismissed(t.id))}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
