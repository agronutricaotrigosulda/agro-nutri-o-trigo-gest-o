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
- Six access levels, area, position, status and sales permission live in protected `user_access`; legacy `user_roles` retains founder identity only, and the first account becomes a partner; why: independent institutional positions must not grant confidential access.
- Critical employee, payroll, payment and governance transitions use authenticated database functions and immutable audit events; why: enforce ownership, concurrency and duplicate prevention beyond the UI.
- Workspace credentials stay in authenticated server functions, with partner-only access and transactional project-total updates; why: the central Google account is shared infrastructure, not an employee permission.
- Payroll drafts preserve unknown tax as null and cannot be signed or paid until an officially validated calculation exists; why: missing tax data must never silently become a zero deduction.
