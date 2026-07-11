import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import filters from "./filters.slice";
import orderWizard from "./order-wizard.slice";
import { rootSaga } from "./sagas";
import ui from "./ui.slice";

export function makeStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { filters, ui, orderWizard },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
  });
  sagaMiddleware.run(rootSaga);
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
