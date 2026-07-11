import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  toasts: Toast[];
}

const initialState: UiState = { toasts: [] };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toastAdded: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload);
      },
      prepare(input: { type: ToastType; message: string }) {
        return { payload: { id: nanoid(), ...input } };
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toastAdded, toastDismissed } = uiSlice.actions;

export const notifySuccess = (message: string) =>
  toastAdded({ type: "success", message });
export const notifyError = (message: string) =>
  toastAdded({ type: "error", message });

export default uiSlice.reducer;
