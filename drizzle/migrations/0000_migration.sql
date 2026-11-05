
create type public.app_role as enum ('socio_fundador','socio','gerente','diretor','funcionario','vendedor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique(user_id, role)
);
grant select, update on public.profiles to authenticated; grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create or replace function public.is_gestao(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role in ('socio_fundador','socio','gerente','diretor')) $$;
create or replace function public.can_sell(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role in ('vendedor','gerente','socio_fundador')) $$;

create policy "profiles self or gestao" on public.profiles for select to authenticated using (id = auth.uid() or public.is_gestao(auth.uid()));
create policy "profiles update self" on public.profiles for update to authenticated using (id = auth.uid());
create policy "roles self or gestao" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_gestao(auth.uid()));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  if (select count(*) from public.user_roles) = 0 then
    insert into public.user_roles(user_id, role) values (new.id,'socio_fundador'),(new.id,'gerente');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null check (category in ('horticolas','frangos','ovos')),
  unit text not null default 'kg', price_retail numeric not null default 0, price_wholesale numeric not null default 0,
  max_discount_pct numeric not null default 0, active boolean not null default true, created_at timestamptz not null default now()
);
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid(), product_id uuid not null references public.products(id),
  mode text not null check (mode in ('retalho','grosso')), quantity numeric not null check (quantity > 0),
  base_price numeric not null default 0, unit_price numeric not null, discount_pct numeric not null default 0,
  total numeric not null default 0, exception_reason text, created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated; grant all on public.products to service_role;
grant select, insert on public.sales to authenticated; grant all on public.sales to service_role;
alter table public.products enable row level security; alter table public.sales enable row level security;
create policy "products read sellers" on public.products for select to authenticated using (public.can_sell(auth.uid()) or public.is_gestao(auth.uid()));
create policy "products manage direcao" on public.products for all to authenticated using (public.has_role(auth.uid(),'gerente') or public.has_role(auth.uid(),'socio_fundador') or public.has_role(auth.uid(),'diretor')) with check (public.has_role(auth.uid(),'gerente') or public.has_role(auth.uid(),'socio_fundador') or public.has_role(auth.uid(),'diretor'));
create policy "sales read" on public.sales for select to authenticated using (seller_id = auth.uid() or public.is_gestao(auth.uid()));
create policy "sales insert" on public.sales for insert to authenticated with check (seller_id = auth.uid() and public.can_sell(auth.uid()));

create or replace function public.validate_sale() returns trigger language plpgsql security definer set search_path = public as $$
declare p public.products; expected numeric;
begin
  select * into p from public.products where id = new.product_id;
  if p.id is null or not p.active then raise exception 'Produto inválido'; end if;
  new.base_price := case when new.mode='grosso' then p.price_wholesale else p.price_retail end;
  if new.discount_pct < 0 or new.discount_pct > p.max_discount_pct then
    raise exception 'Desconto acima do teto permitido (% %%)', p.max_discount_pct;
  end if;
  expected := round(new.base_price * (1 - new.discount_pct/100), 2);
  if round(new.unit_price,2) <> expected and coalesce(btrim(new.exception_reason),'') = '' then
    raise exception 'Preço de exceção exige motivo';
  end if;
  new.total := round(new.unit_price * new.quantity, 2);
  new.seller_id := auth.uid();
  return new;
end $$;
create trigger sales_validate before insert on public.sales for each row execute function public.validate_sale();

create table public.budgets (
  id uuid primary key default gen_random_uuid(), year int not null, category text not null,
  planned numeric not null default 0, spent numeric not null default 0, created_at timestamptz not null default now()
);
create table public.debts (
  id uuid primary key default gen_random_uuid(), direction text not null check (direction in ('pagar','receber')),
  party text not null, description text, amount numeric not null check (amount > 0), due_date date,
  created_at timestamptz not null default now()
);
create table public.debt_payments (
  id uuid primary key default gen_random_uuid(), debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric not null check (amount > 0), paid_at date not null default current_date, proof_path text,
  created_at timestamptz not null default now()
);
create table public.employees (
  id uuid primary key default gen_random_uuid(), user_id uuid, full_name text not null, email text,
  doc_type text not null default 'BI' check (doc_type in ('BI','DIRE')), doc_number text not null,
  position text, base_salary numeric not null default 0, hire_date date not null default current_date,
  union_member boolean not null default false, union_pct numeric not null default 1, created_at timestamptz not null default now()
);
create table public.evaluations (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.employees(id) on delete cascade,
  period text not null, score numeric not null check (score >= 0 and score <= 10), notes text, created_at timestamptz not null default now()
);
create table public.absences (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.employees(id) on delete cascade,
  absence_date date not null, reason text not null, proof_path text, created_at timestamptz not null default now()
);
create table public.vacations (
  id uuid primary key default gen_random_uuid(), employee_id uuid not null references public.employees(id) on delete cascade,
  start_date date not null, days int not null check (days > 0), created_at timestamptz not null default now()
);
create table public.shareholders (
  id uuid primary key default gen_random_uuid(), user_id uuid, name text not null,
  capital_pct numeric not null check (capital_pct > 0 and capital_pct <= 100), founder boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.resolutions (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  status text not null default 'aberta' check (status in ('aberta','aprovada','rejeitada')),
  created_by uuid default auth.uid(), created_at timestamptz not null default now()
);
create table public.resolution_votes (
  id uuid primary key default gen_random_uuid(), resolution_id uuid not null references public.resolutions(id) on delete cascade,
  shareholder_id uuid not null references public.shareholders(id) on delete cascade,
  vote text not null check (vote in ('favor','contra','veto')), created_at timestamptz not null default now(),
  unique(resolution_id, shareholder_id)
);
create table public.approvals (
  id uuid primary key default gen_random_uuid(), title text not null, amount numeric not null default 0,
  level text not null default 'diretor' check (level in ('diretor','gerente','socios')),
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado')),
  requested_by uuid default auth.uid(), created_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), name text not null, description text,
  revenue numeric not null default 0, expenses numeric not null default 0, created_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete set null,
  title text not null, due_date date, done boolean not null default false, assignee text, created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['budgets','debts','debt_payments','employees','evaluations','absences','vacations','shareholders','resolutions','resolution_votes','approvals','projects','tasks'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "gestao all" on public.%I for all to authenticated using (public.is_gestao(auth.uid())) with check (public.is_gestao(auth.uid()))', t);
  end loop;
end $$;

create policy "employee self read" on public.employees for select to authenticated using (user_id = auth.uid());
create policy "absence self read" on public.absences for select to authenticated using (exists (select 1 from public.employees e where e.id = employee_id and e.user_id = auth.uid()));
create policy "absence self insert" on public.absences for insert to authenticated with check (exists (select 1 from public.employees e where e.id = employee_id and e.user_id = auth.uid()));
create policy "tasks all read" on public.tasks for select to authenticated using (true);
create policy "approvals own" on public.approvals for select to authenticated using (requested_by = auth.uid());
create policy "approvals request" on public.approvals for insert to authenticated with check (requested_by = auth.uid());

create policy "comprovativos read" on storage.objects for select to authenticated using (bucket_id = 'comprovativos');
create policy "comprovativos upload" on storage.objects for insert to authenticated with check (bucket_id = 'comprovativos');

insert into public.products(name, category, unit, price_retail, price_wholesale, max_discount_pct) values
 ('Alface','horticolas','unid',50,40,10),('Tomate','horticolas','kg',80,65,10),('Couve','horticolas','unid',40,30,10),
 ('Frango vivo','frangos','unid',350,300,5),('Frango abatido','frangos','kg',280,240,5),
 ('Ovos (bandeja 30)','ovos','bandeja',450,400,8),('Ovos (dúzia)','ovos','dúzia',190,170,8);
