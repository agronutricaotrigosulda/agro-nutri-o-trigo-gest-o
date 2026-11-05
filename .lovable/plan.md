# Agro-Nutrição Trigo — Aplicativo de Gestão

Construção por fases, para entregar algo utilizável cedo e validar cada módulo.

## Fase 1 — Base
- Identidade: logotipo e emblema na barra lateral, cabeçalho e ícone; verde agrícola + dourado/âmbar; nome "Agro-Nutrição Trigo" em todo o sistema (sem "AgroEI").
- Lovable Cloud: contas, base de dados e ficheiros (comprovativos).
- Acesso: o gestor convida o funcionário por e-mail; o funcionário recebe link de ativação e define a sua senha.
- Perfis: Sócio Fundador, Sócio, Gerente/CEO, Diretor, Funcionário, Funcionário de Vendas (perfis guardados à parte, verificados no servidor).
- Painel lateral responsivo (PC, tablet, telemóvel) + botão discreto "Instalar no ecrã inicial".

## Fase 2 — Vendas
- Terminal de vendas: hortícolas, frangos, ovos; retalho e grosso.
- Preços de tabela definidos pela direção, bloqueados ao vendedor.
- Desconto até ao teto definido pela direção.
- Preço de exceção exige motivo obrigatório; fica registado para revisão.

## Fase 3 — Finanças (MZN)
- Orçamento anual com alertas: verde positivo, amarelo ≤ 20%, vermelho ≤ 10%; símbolo "MT" a 50% do tamanho.
- Dívidas: "Quem a empresa deve" / "Quem nos deve", comprovativos, pagamentos parciais e totais.
- Distribuição de resultados: 25% reserva legal, 20% reinvestimento, 50% sócios, 5% ação social.

## Fase 4 — Governação
- Deliberações com votação por capital; aprovação exige quórum de 70%; veto dos Sócios Fundadores.
- Fluxo de aprovações por nível (Funcionário → Diretor → Gerente/CEO → Sócios).

## Fase 5 — Recursos Humanos
- Cadastro com BI/DIRE; folha salarial com INSS e sindicato opcional.
- Férias cumulativas: 15 dias (1º ano), 24 (2º), 30 (3º em diante).
- Avaliação de desempenho 0–10 com faixas.
- Justificação de faltas com comprovativo em até 48h.

## Fase 6 — Projetos, Tarefas e Google Sheets
- Balanço financeiro por projeto.
- Leitura de faturamento total, saída total e lucro da planilha Google Sheets.
- Tarefas com prazos e alerta vermelho perto do vencimento.

## Detalhes técnicos
- Regras de cálculo (alertas de orçamento, férias, reservas, quórum, teto de desconto) num módulo puro com testes.
- Google Sheets via conector; e-mails de ativação com o domínio de e-mail da empresa (é preciso um domínio próprio).
