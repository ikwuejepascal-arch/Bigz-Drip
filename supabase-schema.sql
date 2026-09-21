create table public.drop_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    media_url text,
    media_type text,
    likes integer not null default 0,
    created_at timestamptz not null default now()
);

create table public.drop_replies (
    id uuid primary key default gen_random_uuid(),
    post_id uuid not null references public.drop_posts(id) on delete cascade,
    name text not null,
    body text not null,
    created_at timestamptz not null default now()
);

alter table public.drop_posts enable row level security;
alter table public.drop_replies enable row level security;

create policy "Anyone can view drops" on public.drop_posts for select using (true);
create policy "Anyone can post drope" on public.drop_posts for select using (true);
create policy "Anyone can remove drope" on public.drop_post for select using (true);


create or replace function public.increment_drop_like(post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
    update drop_posts set likes = likes + 1 where id = post_id;
$$;

grant execute on function public.increment_drop_like(uuid) to anon;

insert into storage.buckets (id, name, public)
values ('drop-media', 'drop-media', true)
on conflict (id) do nothing;

create policy "Anyone can view drop media" on storage.objects for select using (bucket_id = 'drop-media');
create policy "Anyone can upload drop media" on storage.objects for insert with check (bucket_id = 'drop-media');
