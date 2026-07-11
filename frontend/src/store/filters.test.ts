import { describe, expect, it } from "vitest";
import reducer, { filterSet, filtersReset } from "./filters.slice";

describe("filters slice", () => {
  it("define e remove um filtro", () => {
    let state = reducer({}, filterSet({ key: "status", value: "CRIADA" }));
    expect(state.status).toBe("CRIADA");
    state = reducer(state, filterSet({ key: "status", value: undefined }));
    expect(state.status).toBeUndefined();
  });

  it("limpa todos os filtros", () => {
    const state = reducer(
      { status: "CRIADA", clientId: "c1" },
      filtersReset(),
    );
    expect(state).toEqual({});
  });
});
