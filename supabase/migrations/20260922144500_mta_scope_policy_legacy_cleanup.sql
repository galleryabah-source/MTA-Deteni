-- Remove superseded broad child-table policies left by the legacy RBAC migration.
drop policy if exists mta_placements_insert_editor on public.mta_placements;
drop policy if exists mta_placements_update_editor on public.mta_placements;
drop policy if exists mta_placements_delete_admin on public.mta_placements;
drop policy if exists mta_movements_insert_editor on public.mta_movements;
drop policy if exists mta_movements_update_editor on public.mta_movements;
drop policy if exists mta_movements_delete_admin on public.mta_movements;
drop policy if exists mta_leaves_insert_editor on public.mta_leaves;
drop policy if exists mta_leaves_update_editor on public.mta_leaves;
drop policy if exists mta_leaves_delete_admin on public.mta_leaves;