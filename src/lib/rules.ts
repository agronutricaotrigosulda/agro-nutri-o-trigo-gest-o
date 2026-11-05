// Regras de negócio puras da Agro-Nutrição Trigo (Manual Mestre + Estatuto).

export type BudgetAlert = "verde" | "amarelo" | "vermelho";

/** Saldo restante do orçamento: > 20% verde, <= 20% amarelo, <= 10% vermelho. */
export function budgetAlert(planned: number, spent: number): BudgetAlert {
  if (planned <= 0) return spent > 0 ? "vermelho" : "verde";
  const remaining = (planned - spent) / planned;
  if (remaining <= 0.1) return "vermelho";
  if (remaining <= 0.2) return "amarelo";
  return "verde";
}

/** Distribuição estatutária dos resultados. */
export const RESERVAS = { legal: 0.25, reinvestimento: 0.2, socios: 0.5, social: 0.05 } as const;
export function distribuirLucro(lucro: number) {
  const base = Math.max(0, lucro);
  return {
    legal: base * RESERVAS.legal,
    reinvestimento: base * RESERVAS.reinvestimento,
    socios: base * RESERVAS.socios,
    social: base * RESERVAS.social,
  };
}

/** Quórum qualificado de 70% do capital; qualquer veto de sócio fundador bloqueia. */
export function deliberacao(
  votos: { capital_pct: number; founder: boolean; vote: "favor" | "contra" | "veto" }[],
): "aprovada" | "rejeitada" | "pendente" {
  if (votos.some((v) => v.founder && v.vote === "veto")) return "rejeitada";
  const favor = votos.filter((v) => v.vote === "favor").reduce((s, v) => s + v.capital_pct, 0);
  if (favor >= 70) return "aprovada";
  const contra = votos.filter((v) => v.vote !== "favor").reduce((s, v) => s + v.capital_pct, 0);
  if (contra > 30) return "rejeitada";
  return "pendente";
}

/** Férias cumulativas: 15 dias no 1º ano, 24 no 2º, 30 a partir do 3º. */
export function feriasAcumuladas(hireDate: Date, today: Date = new Date()): number {
  const ms = today.getTime() - hireDate.getTime();
  if (ms < 0) return 0;
  const anosIniciados = Math.floor(ms / (365.25 * 24 * 3600 * 1000)) + 1;
  let total = 0;
  for (let ano = 1; ano <= anosIniciados; ano++) total += ano === 1 ? 15 : ano === 2 ? 24 : 30;
  return total;
}

/** Folha salarial: INSS do trabalhador 3%, da empresa 4%; sindicato opcional. */
export function folhaSalarial(base: number, sindicato: boolean, sindicatoPct = 1) {
  const inss = base * 0.03;
  const sind = sindicato ? base * (sindicatoPct / 100) : 0;
  return { base, inss, sindicato: sind, liquido: base - inss - sind, inssEmpresa: base * 0.04 };
}

export function faixaDesempenho(score: number): string {
  if (score < 5) return "Insuficiente";
  if (score < 7) return "Satisfatório";
  if (score < 8.5) return "Bom";
  return "Excelente";
}

/** Comprovativo de falta tem de ser entregue até 48h depois da falta. */
export function faltaDentroDoPrazo(absenceDate: Date, submitted: Date = new Date()): boolean {
  return submitted.getTime() - absenceDate.getTime() <= 48 * 3600 * 1000;
}

/** Venda: desconto até ao teto; preço diferente do calculado exige motivo. */
export function validarVenda(input: {
  basePrice: number;
  discountPct: number;
  maxDiscountPct: number;
  unitPrice: number;
  reason?: string;
}): string | null {
  if (input.discountPct < 0 || input.discountPct > input.maxDiscountPct)
    return `Desconto acima do teto permitido (${input.maxDiscountPct}%)`;
  const expected = Math.round(input.basePrice * (1 - input.discountPct / 100) * 100) / 100;
  if (Math.round(input.unitPrice * 100) / 100 !== expected && !input.reason?.trim())
    return "Preço de exceção exige motivo";
  return null;
}

/** Tarefa em alerta vermelho: não concluída e a vencer em 3 dias ou já vencida. */
export function tarefaUrgente(due: string | null, done: boolean, today: Date = new Date()): boolean {
  if (!due || done) return false;
  return new Date(due).getTime() - today.getTime() <= 3 * 24 * 3600 * 1000;
}

/** Nível de aprovação segundo o valor (MZN). */
export function nivelAprovacao(valor: number): "diretor" | "gerente" | "socios" {
  if (valor <= 50000) return "diretor";
  if (valor <= 500000) return "gerente";
  return "socios";
}
