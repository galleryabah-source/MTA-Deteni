begin;
drop policy if exists mta_documents_select_auth on public.mta_documents;
create policy mta_documents_select_authorized on public.mta_documents for select to authenticated using (private.mta_current_role() = any(array['OWNER','ADMIN','AUDITOR']) or (private.mta_current_role() = any(array['EDITOR','REVIEWER']) and created_by = auth.uid()));
drop policy if exists mta_storage_metadata_select_authorized on public.mta_storage_objects;
create policy mta_storage_metadata_select_authorized on public.mta_storage_objects for select to authenticated using (private.mta_current_role() = any(array['OWNER','ADMIN','AUDITOR']) or (private.mta_current_role() = any(array['EDITOR','REVIEWER']) and exists (select 1 from public.mta_documents d where d.id=mta_storage_objects.document_id and d.created_by=auth.uid())));
commit;