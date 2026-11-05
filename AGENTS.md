<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Business rules (budget alerts, holidays, payroll, quorum, discounts) live in `src/lib/rules.ts` with tests in `src/test/rules.test.ts`; why: single tested source of truth.
- Sale price/discount rules are also enforced by the `validate_sale` DB trigger; why: sellers cannot bypass the UI.
- Roles live in `user_roles`, checked via `has_role`/`is_gestao`/`can_sell`; the first account becomes Sócio Fundador + Gerente; why: avoid privilege escalation.
