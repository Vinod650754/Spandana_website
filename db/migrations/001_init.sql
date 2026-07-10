create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text not null,
  venue text not null,
  event_date timestamptz not null,
  status text not null check (status in ('upcoming', 'ongoing', 'completed')),
  banner_url text,
  gallery jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  branch text,
  year text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  caption text,
  category text not null,
  image_url text not null,
  cloudinary_public_id text,
  width integer,
  height integer,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  category text not null check (category in ('faculty', 'student')),
  photo_url text,
  social jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contact_info (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  phone text not null,
  whatsapp text,
  instagram text,
  linkedin text,
  maps_url text,
  address text,
  updated_at timestamptz not null default now()
);

create table if not exists homepage_content (
  id uuid primary key default uuid_generate_v4(),
  hero jsonb not null default '{}'::jsonb,
  impact jsonb not null default '[]'::jsonb,
  about jsonb not null default '{}'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into contact_info (email, phone, whatsapp, instagram, linkedin, maps_url, address)
values (
  'spandana@smvit.edu.in',
  '+91 90000 00000',
  'https://wa.me/919000000000',
  'https://instagram.com/spandana.smvit',
  'https://linkedin.com/company/spandana-smvit',
  'https://maps.google.com',
  'Sir M Visvesvaraya Institute of Technology, Bengaluru'
)
on conflict do nothing;
