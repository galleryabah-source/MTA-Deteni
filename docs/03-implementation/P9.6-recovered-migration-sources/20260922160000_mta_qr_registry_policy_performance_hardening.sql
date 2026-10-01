-- MTA DETENI QR registry policy/performance hardening
-- Avoid overlapping permissive SELECT policies by making write policies action-specific.
-- Add covering indexes for QR registry creator/revoker foreign keys.

drop policy if exists mta_qr_registry_write_scope on public.mta_qr_registry;

create policy mta_qr_registry_insert_scope on public.mta_qr_registry
for insert to authenticated
with check (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1 from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
);

create policy mta_qr_registry_update_scope on public.mta_qr_registry
for update to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1 from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
)
with check (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1 from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
);

create policy mta_qr_registry_delete_scope on public.mta_qr_registry
for delete to authenticated
using (
  private.mta_current_role() in ('OWNER','ADMIN')
  or (
    private.mta_current_role() = 'EDITOR'
    and exists (
      select 1 from public.mta_detainees d
      join public.mta_profile_scopes ps on ps.scope_id = d.scope_id
      where d.id = mta_qr_registry.resource_id
        and ps.profile_id = (select auth.uid())
        and ps.active = true
    )
  )
);

create index if not exists mta_qr_registry_created_by_idx
on public.mta_qr_registry(created_by);

create index if not exists mta_qr_registry_revoked_by_idx
on public.mta_qr_registry(revoked_by);
