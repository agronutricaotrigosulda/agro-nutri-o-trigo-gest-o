import type { Database } from "@/integrations/supabase/types";
type Employee = Database["public"]["Tables"]["employees"]["Row"];
type Payroll = Database["public"]["Tables"]["payroll_runs"]["Row"];
export function downloadReceipt(e:Employee,p:Payroll){
 if(!p.hr_signed_at||!p.employee_signed_at||p.status!=="confirmado")throw new Error("Assinaturas e confirmação obrigatórias");
 const text=["Agro-Nutrição Trigo",`Recibo salarial ${p.period.slice(0,7)}`,`Funcionário: ${e.full_name}`,`Base: ${p.base} MT`,`Faltas: ${p.absence_deduction} MT`,`INSS trabalhador: ${p.inss_worker} MT`,`Sindicato: ${p.union_deduction} MT`,`IRPS: ${p.irps} MT`,`Líquido: ${p.net} MT`,`Assinatura eletrónica RH: ${p.hr_signed_by} em ${p.hr_signed_at}`,`Confirmação e assinatura eletrónica funcionário: ${p.employee_signed_by} em ${p.employee_signed_at}`,`Identificador: ${p.id}`].join("\n");
 const url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=`recibo-${p.period.slice(0,7)}.txt`;a.click();URL.revokeObjectURL(url);
}