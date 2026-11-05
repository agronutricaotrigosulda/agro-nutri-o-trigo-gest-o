drop policy if exists "tasks all read" on public.tasks;
drop policy if exists "comprovativos read" on storage.objects;
drop policy if exists "comprovativos upload" on storage.objects;
create policy "comprovativos read" on storage.objects for select to authenticated
  using (bucket_id = 'comprovativos' and (owner_id = (select auth.uid()::text) or public.is_gestao(auth.uid())));
create policy "comprovativos upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'comprovativos' and owner_id = (select auth.uid()::text)
    and ((storage.foldername(name))[1] = 'faltas' or ((storage.foldername(name))[1] = 'dividas' and public.is_gestao(auth.uid()))));