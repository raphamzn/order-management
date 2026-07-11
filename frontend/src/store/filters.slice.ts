import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OrderFilters } from "@/lib/api/types";

const initialState: OrderFilters = {};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    filterSet(
      state,
      action: PayloadAction<{ key: keyof OrderFilters; value?: string }>,
    ) {
      const { key, value } = action.payload;
      if (value) {
        state[key] = value as never;
      } else {
        delete state[key];
      }
    },
    filtersReset() {
      return {};
    },
  },
});

export const { filterSet, filtersReset } = filtersSlice.actions;
export default filtersSlice.reducer;
