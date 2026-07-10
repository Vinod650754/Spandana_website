create table if not exists contact_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null unique default 'primary',
  email text not null,
  phone text not null,
  whatsapp text,
  instagram text,
  linkedin text,
  youtube text,
  facebook text,
  maps_url text,
  address text,
  office_hours text,
  contact_form_enabled boolean not null default true,
  success_message text not null default 'Thank you for reaching out. We will get back to you soon.',
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table contact_messages
  add column if not exists updated_at timestamptz not null default now();

alter table contact_messages
  alter column status set default 'new';

update contact_messages
set status = 'read'
where status = 'unread';

update contact_messages
set status = 'new'
where status not in ('new', 'read', 'archived');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_messages_status_check'
  ) then
    alter table contact_messages
      add constraint contact_messages_status_check
      check (status in ('new', 'read', 'archived'));
  end if;
end $$;

insert into contact_settings (
  settings_key,
  email,
  phone,
  whatsapp,
  instagram,
  linkedin,
  youtube,
  facebook,
  maps_url,
  address,
  office_hours,
  contact_form_enabled,
  success_message,
  updated_by
)
select
  'primary',
  coalesce(email, 'spandana@smvit.edu.in'),
  coalesce(phone, '+91 90000 00000'),
  whatsapp,
  instagram,
  linkedin,
  null,
  null,
  maps_url,
  address,
  'Monday to Friday, 9:00 AM - 5:00 PM',
  true,
  'Thank you for reaching out. We will get back to you soon.',
  'contact-cms-migration'
from contact_info
order by updated_at desc
limit 1
on conflict (settings_key) do nothing;

insert into contact_settings (
  settings_key,
  email,
  phone,
  whatsapp,
  instagram,
  linkedin,
  maps_url,
  address,
  office_hours,
  contact_form_enabled,
  success_message,
  updated_by
)
values (
  'primary',
  'spandana@smvit.edu.in',
  '+91 90000 00000',
  'https://wa.me/919000000000',
  'https://instagram.com/spandana.smvit',
  'https://linkedin.com/company/spandana-smvit',
  'https://maps.google.com',
  'Sir M Visvesvaraya Institute of Technology, Bengaluru',
  'Monday to Friday, 9:00 AM - 5:00 PM',
  true,
  'Thank you for reaching out. We will get back to you soon.',
  'contact-cms-migration'
)
on conflict (settings_key) do nothing;
