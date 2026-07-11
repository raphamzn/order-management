import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WizardItem {
  itemId: string;
  quantity: number;
}

interface WizardState {
  step: number;
  clientId?: string;
  transportTypeId?: string;
  items: WizardItem[];
}

const initialState: WizardState = { step: 0, items: [] };

const orderWizardSlice = createSlice({
  name: "orderWizard",
  initialState,
  reducers: {
    wizardClientSet(state, action: PayloadAction<string | undefined>) {
      state.clientId = action.payload;
      // trocar de cliente invalida o transporte escolhido (autorização é por cliente)
      state.transportTypeId = undefined;
    },
    wizardTransportSet(state, action: PayloadAction<string | undefined>) {
      state.transportTypeId = action.payload;
    },
    wizardItemAdded(state, action: PayloadAction<WizardItem>) {
      const existing = state.items.find(
        (i) => i.itemId === action.payload.itemId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    wizardItemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
    },
    wizardStepSet(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    wizardReset() {
      return initialState;
    },
  },
});

export const {
  wizardClientSet,
  wizardTransportSet,
  wizardItemAdded,
  wizardItemRemoved,
  wizardStepSet,
  wizardReset,
} = orderWizardSlice.actions;

export default orderWizardSlice.reducer;
