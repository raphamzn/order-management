import { all } from "redux-saga/effects";
import { orderSaga } from "./order.saga";

export function* rootSaga() {
  yield all([orderSaga()]);
}
