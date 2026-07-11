"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiErrorMessage } from "@/lib/api/client";
import { useScheduleOrder } from "@/lib/api/orders";
import type { Schedule } from "@/lib/api/types";
import { useAppDispatch } from "@/store/hooks";
import { notifyError, notifySuccess } from "@/store/ui.slice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const schema = z
  .object({
    deliveryDate: z.string().min(1, "Informe a data de entrega"),
    windowStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    windowEnd: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
  })
  .refine((v) => v.windowStart < v.windowEnd, {
    message: "A janela deve terminar depois de começar",
    path: ["windowEnd"],
  });

type FormValues = z.infer<typeof schema>;

export function ScheduleForm({
  orderId,
  schedule,
  onDone,
}: {
  orderId: string;
  schedule: Schedule | null;
  onDone: () => void;
}) {
  const dispatch = useAppDispatch();
  const mutation = useScheduleOrder(orderId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryDate: schedule ? schedule.deliveryDate.slice(0, 10) : "",
      windowStart: schedule?.windowStart ?? "08:00",
      windowEnd: schedule?.windowEnd ?? "12:00",
    },
  });

  const onSubmit = (values: FormValues) =>
    mutation.mutate(values, {
      onSuccess: () => {
        dispatch(
          notifySuccess(schedule ? "Agendamento atualizado" : "Entrega agendada"),
        );
        onDone();
      },
      onError: (error) => dispatch(notifyError(apiErrorMessage(error))),
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Data de entrega"
        type="date"
        error={errors.deliveryDate?.message}
        {...register("deliveryDate")}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Janela - início"
          type="time"
          error={errors.windowStart?.message}
          {...register("windowStart")}
        />
        <Input
          label="Janela - fim"
          type="time"
          error={errors.windowEnd?.message}
          {...register("windowEnd")}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {schedule ? "Reagendar" : "Agendar"}
        </Button>
      </div>
    </form>
  );
}
