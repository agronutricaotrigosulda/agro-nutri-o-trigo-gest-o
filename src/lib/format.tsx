import { cn } from "@/lib/utils";

/** Valor em Meticais com o símbolo "MT" reduzido a 50%. */
export function Money({ value, className }: { value: number | null | undefined; className?: string }) {
  const n = Number(value ?? 0);
  return (
    <span className={cn("tabular-nums whitespace-nowrap", className)}>
      {n.toLocaleString("pt-MZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      <span className="ml-0.5 align-baseline text-[0.5em] font-semibold">MT</span>
    </span>
  );
}

export const ROLE_LABEL: Record<string, string> = {
  socio_fundador: "Sócio Fundador",
  socio: "Sócio",
  gerente: "Gerente/CEO",
  diretor: "Diretor",
  funcionario: "Funcionário",
  vendedor: "Funcionário de Vendas",
};
