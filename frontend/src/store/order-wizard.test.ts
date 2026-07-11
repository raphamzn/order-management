import { describe, expect, it } from "vitest";
import reducer, {
  wizardClientSet,
  wizardItemAdded,
  wizardItemRemoved,
  wizardReset,
  wizardTransportSet,
} from "./order-wizard.slice";

const initial = reducer(undefined, { type: "@@INIT" });

describe("orderWizard slice", () => {
  it("acumula a quantidade ao adicionar o mesmo item", () => {
    let state = reducer(initial, wizardItemAdded({ itemId: "a", quantity: 2 }));
    state = reducer(state, wizardItemAdded({ itemId: "a", quantity: 3 }));
    expect(state.items).toEqual([{ itemId: "a", quantity: 5 }]);
  });

  it("remove um item pela referência", () => {
    let state = reducer(initial, wizardItemAdded({ itemId: "a", quantity: 1 }));
    state = reducer(state, wizardItemAdded({ itemId: "b", quantity: 1 }));
    state = reducer(state, wizardItemRemoved("a"));
    expect(state.items).toEqual([{ itemId: "b", quantity: 1 }]);
  });

  it("trocar de cliente limpa o transporte selecionado", () => {
    let state = reducer(initial, wizardTransportSet("t1"));
    state = reducer(state, wizardClientSet("c1"));
    expect(state.clientId).toBe("c1");
    expect(state.transportTypeId).toBeUndefined();
  });

  it("wizardReset volta ao estado inicial", () => {
    let state = reducer(initial, wizardClientSet("c1"));
    state = reducer(state, wizardItemAdded({ itemId: "a", quantity: 1 }));
    expect(reducer(state, wizardReset())).toEqual(initial);
  });
});
