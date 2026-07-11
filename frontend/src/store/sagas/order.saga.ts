import { call, put, takeEvery } from "redux-saga/effects";
import { STATUS_LABEL } from "@/domain/order-status";
import { apiErrorMessage } from "@/lib/api/client";
import { confirmSchedule, updateOrderStatus } from "@/lib/api/orders";
import { getQueryClient } from "@/lib/query/client";
import { queryKeys } from "@/lib/query/keys";
import { notifyError, notifySuccess } from "../ui.slice";
import { orderStatusRequested, scheduleConfirmRequested } from "./order.actions";

function invalidateOrders() {
  const qc = getQueryClient();
  return Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
    qc.invalidateQueries({ queryKey: queryKeys.audit.all }),
  ]);
}

function* onStatusRequested(action: ReturnType<typeof orderStatusRequested>) {
  const { orderId, to } = action.payload;
  try {
    yield call(updateOrderStatus, orderId, to);
    yield call(invalidateOrders);
    yield put(notifySuccess(`Status atualizado para ${STATUS_LABEL[to]}`));
  } catch (error) {
    yield put(notifyError(apiErrorMessage(error)));
  }
}

function* onScheduleConfirmRequested(
  action: ReturnType<typeof scheduleConfirmRequested>,
) {
  const { orderId, currentStatus } = action.payload;
  try {
    yield call(confirmSchedule, orderId);
    // Orquestração multi-step: se a OV está planejada, confirmar o
    // agendamento já a avança para AGENDADA numa única ação do usuário.
    if (currentStatus === "PLANEJADA") {
      yield call(updateOrderStatus, orderId, "AGENDADA");
      yield call(invalidateOrders);
      yield put(notifySuccess("Agendamento confirmado e OV agendada"));
    } else {
      yield call(invalidateOrders);
      yield put(notifySuccess("Agendamento confirmado"));
    }
  } catch (error) {
    yield put(notifyError(apiErrorMessage(error)));
  }
}

export function* orderSaga() {
  yield takeEvery(orderStatusRequested.type, onStatusRequested);
  yield takeEvery(scheduleConfirmRequested.type, onScheduleConfirmRequested);
}
