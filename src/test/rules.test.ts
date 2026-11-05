import { describe, it, expect } from "vitest";
import { budgetAlert, distribuirLucro, deliberacao, feriasAcumuladas, folhaSalarial, faltaDentroDoPrazo, validarVenda } from "@/lib/rules";

describe("regras", () => {
  it("alertas de orçamento", () => {
    expect(budgetAlert(100, 50)).toBe("verde");
    expect(budgetAlert(100, 81)).toBe("amarelo");
    expect(budgetAlert(100, 91)).toBe("vermelho");
  });
  it("reservas 25/20/50/5", () => {
    expect(distribuirLucro(1000)).toEqual({ legal: 250, reinvestimento: 200, socios: 500, social: 50 });
  });
  it("quórum 70% e veto de fundador", () => {
    expect(deliberacao([{ capital_pct: 70, founder: false, vote: "favor" }])).toBe("aprovada");
    expect(deliberacao([{ capital_pct: 69, founder: false, vote: "favor" }])).toBe("pendente");
    expect(deliberacao([{ capital_pct: 90, founder: false, vote: "favor" }, { capital_pct: 10, founder: true, vote: "veto" }])).toBe("rejeitada");
  });
  it("férias 15, 24, 30 cumulativas", () => {
    const hoje = new Date("2026-06-01");
    expect(feriasAcumuladas(new Date("2026-01-01"), hoje)).toBe(15);
    expect(feriasAcumuladas(new Date("2025-01-01"), hoje)).toBe(39);
    expect(feriasAcumuladas(new Date("2024-01-01"), hoje)).toBe(69);
  });
  it("INSS 3% e sindicato opcional", () => {
    expect(folhaSalarial(10000, false).liquido).toBe(9700);
    expect(folhaSalarial(10000, true, 1).liquido).toBe(9600);
  });
  it("comprovativo de falta em 48h", () => {
    expect(faltaDentroDoPrazo(new Date("2026-01-01T08:00"), new Date("2026-01-03T07:00"))).toBe(true);
    expect(faltaDentroDoPrazo(new Date("2026-01-01T08:00"), new Date("2026-01-03T09:00"))).toBe(false);
  });
  it("venda: teto de desconto e motivo obrigatório", () => {
    expect(validarVenda({ basePrice: 100, discountPct: 15, maxDiscountPct: 10, unitPrice: 85 })).not.toBeNull();
    expect(validarVenda({ basePrice: 100, discountPct: 10, maxDiscountPct: 10, unitPrice: 90 })).toBeNull();
    expect(validarVenda({ basePrice: 100, discountPct: 0, maxDiscountPct: 10, unitPrice: 70 })).toBe("Preço de exceção exige motivo");
    expect(validarVenda({ basePrice: 100, discountPct: 0, maxDiscountPct: 10, unitPrice: 70, reason: "Cliente fiel" })).toBeNull();
  });
});
