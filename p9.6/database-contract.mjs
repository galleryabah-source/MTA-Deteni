export const P96_CONTRACT = Object.freeze({
  tables: [
    "public.mta_scopes",
    "public.mta_profile_scopes",
    "public.mta_detainees",
    "public.mta_blocks",
    "public.mta_rooms",
    "public.mta_qr_registry",
  ],
  columns: {
    "public.mta_scopes": ["id","code","name","active","metadata","created_at","updated_at"],
    "public.mta_profile_scopes": ["profile_id","scope_id","active","created_at"],
    "public.mta_detainees": ["id","code","name","nationality","status","placement","source","created_at","updated_at","metadata","scope_id"],
    "public.mta_blocks": ["id","code","name","status","scope_id","metadata","created_at","updated_at"],
    "public.mta_rooms": ["id","block_id","code","name","capacity","status","type","gender","scope_id","version","metadata","created_at","updated_at"],
    "public.mta_qr_registry": ["id","resource_type","resource_id","token_hash","token_version","status","context","issued_at","expires_at","created_by","revoked_at","revoked_by","metadata","created_at","updated_at"],
  },
  foreignKeys: {
    "mta_profile_scopes_profile_id_fkey": "FOREIGN KEY (profile_id) REFERENCES public.mta_profiles(id) ON DELETE CASCADE",
    "mta_profile_scopes_scope_id_fkey": "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id) ON DELETE CASCADE",
    "mta_detainees_scope_id_fkey": "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id) ON DELETE RESTRICT",
    "mta_blocks_scope_id_fkey": "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id)",
    "mta_rooms_scope_id_fkey": "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id)",
    "mta_qr_registry_resource_id_fkey": "FOREIGN KEY (resource_id) REFERENCES public.mta_detainees(id) ON DELETE RESTRICT",
  },
  scopeAuthorization: {
    scopeIdentity: "EXPLICIT_CODE_AND_NAME_REQUIRED",
    profileMembership: "ACTIVE_PROFILE_SCOPE_REQUIRED_FOR_SCOPED_OPERATIONAL_ACCESS",
    adminRoles: ["OWNER","ADMIN"],
    metadataPath: "metadata.adminSettings",
    seedRows: false,
  },
});
