import { describe, it, expect } from "vitest";
import {
  emptyRecord,
  formatCurrency,
  parseCurrency,
  formatDateBR,
} from "@/lib/billing";

describe("billing helpers", () => {
  it("emptyRecord has all numeric fields at zero and totalCreditoSistemaPos", () => {
    const r = emptyRecord("2026-01-15");
    expect(r.data).toBe("2026-01-15");
    expect(r.totalCreditoSistemaPos).toBe(0);
    expect(r.credito).toBe(0);
    expect(r.creditoPos).toBe(0);
  });

  it("formatCurrency formats BRL", () => {
    expect(formatCurrency(1234.56)).toMatch(/1\.234,56/);
  });

  it("parseCurrency parses pt-BR style", () => {
    expect(parseCurrency("1.234,56")).toBeCloseTo(1234.56);
    expect(parseCurrency("")).toBe(0);
  });

  it("formatDateBR returns BR date", () => {
    expect(formatDateBR("2026-03-30")).toMatch(/30/);
    expect(formatDateBR("")).toBe("--/--/----");
  });
});
