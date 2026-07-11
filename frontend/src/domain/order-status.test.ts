import { describe, expect, it } from "vitest";
import { isMutable, nextStatus, ORDER_FLOW } from "./order-status";

describe("order-status", () => {
  it("segue a sequência do fluxo operacional", () => {
    expect(nextStatus("CRIADA")).toBe("PLANEJADA");
    expect(nextStatus("PLANEJADA")).toBe("AGENDADA");
    expect(nextStatus("AGENDADA")).toBe("EM_TRANSPORTE");
    expect(nextStatus("EM_TRANSPORTE")).toBe("ENTREGUE");
  });

  it("não há próximo estado após ENTREGUE", () => {
    expect(nextStatus("ENTREGUE")).toBeNull();
  });

  it("ordena o fluxo completo", () => {
    expect(ORDER_FLOW).toEqual([
      "CRIADA",
      "PLANEJADA",
      "AGENDADA",
      "EM_TRANSPORTE",
      "ENTREGUE",
    ]);
  });

  it("só permite (re)agendamento antes da saída para entrega", () => {
    expect(isMutable("CRIADA")).toBe(true);
    expect(isMutable("AGENDADA")).toBe(true);
    expect(isMutable("EM_TRANSPORTE")).toBe(false);
    expect(isMutable("ENTREGUE")).toBe(false);
  });
});
