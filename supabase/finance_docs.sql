-- Financial section (Paycheck Ledger) storage.
-- One row per document; `collection` is one of config, checks, txns, debts, funds.
-- Run once in the Supabase SQL editor.
create table if not exists public.finance_docs (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  collection text not null,
  doc_id     text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection, doc_id)
);

alter table public.finance_docs enable row level security;

drop policy if exists "finance_docs owner" on public.finance_docs;
create policy "finance_docs owner" on public.finance_docs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
