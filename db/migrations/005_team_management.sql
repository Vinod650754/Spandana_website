create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roles_display_order_idx
  on roles (display_order asc, created_at asc);

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists departments_display_order_idx
  on departments (display_order asc, created_at asc);

alter table team_members
  add column if not exists role_id uuid,
  add column if not exists department_id uuid,
  add column if not exists academic_year integer,
  add column if not exists designation text,
  add column if not exists email text,
  add column if not exists linkedin text,
  add column if not exists image_url text,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists cloudinary_public_id text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_members_role_id_fkey'
  ) then
    alter table team_members
      add constraint team_members_role_id_fkey
      foreign key (role_id) references roles(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_members_department_id_fkey'
  ) then
    alter table team_members
      add constraint team_members_department_id_fkey
      foreign key (department_id) references departments(id) on delete restrict;
  end if;
end $$;

create index if not exists team_members_role_department_order_idx
  on team_members (role_id, department_id, display_order asc, created_at asc);

create index if not exists team_members_active_idx
  on team_members (is_active, display_order asc, created_at asc);