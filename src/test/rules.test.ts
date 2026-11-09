import { describe, it, expect } from "vitest";
import { budgetAlert, distribuirLucro, deliberacao, feriasAcumuladas, folhaSalarial, faltaDentroDoPrazo, validarVenda, mesDescontoFalta, dataPagamento, bonusProjeto } from "@/lib/rules";

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
  it("férias acumulam 12 no primeiro ano e 30 no segundo", () => {
    expect(feriasAcumuladas(new Date("2025-01-01"), new Date("2026-01-01"))).toBe(12);
    expect(feriasAcumuladas(new Date("2025-01-01"), new Date("2027-01-01"))).toBe(42);
    expect(feriasAcumuladas(new Date("2025-01-01"), new Date("2025-07-01"))).toBe(6);
  });
  it("falta do dia 10 transita e dia 9 não", () => {
    expect(mesDescontoFalta("2026-11-09")).toBe("2026-11");
    expect(mesDescontoFalta("2026-11-10")).toBe("2026-12");
    expect(mesDescontoFalta("2026-12-10")).toBe("2027-01");
  });
  it("pagamento sábado antecipa sexta e domingo adia", () => {
    expect(dataPagamento("2026-06")).toBe("2026-06-19");
    expect(dataPagamento("2026-09")).toBe("2026-09-21");
    expect(dataPagamento("2026-11", ["2026-11-20"])).toBe("2026-11-23");
  });
  it("bónus 10%/8% apenas durante um ano", () => {
    expect(bonusProjeto(1000, false, "2026-01-01", "2026-12-31")).toBe(100);
    expect(bonusProjeto(1000, true, "2026-01-01", "2026-12-31")).toBe(80);
    expect(bonusProjeto(1000, false, "2026-01-01", "2027-01-01")).toBe(0);
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
