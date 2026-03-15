-- Run this in Supabase SQL Editor to set up the progress table

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id text not null,
  is_read boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  unique(user_id, resource_id)
);

-- Auto-update updated_at on every write
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_progress_updated_at on public.progress;
create trigger set_progress_updated_at
  before update on public.progress
  for each row execute procedure public.set_updated_at();

-- Enable Row Level Security
alter table public.progress enable row level security;

-- Users can only read and write their own rows
create policy "Users can view own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on public.progress for delete
  using (auth.uid() = user_id);
