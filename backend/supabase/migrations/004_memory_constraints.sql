-- Add unique constraint on temporary_context (user_id, key) for upsert
alter table temporary_context
  add constraint if not exists temporary_context_user_key_unique unique (user_id, key);
