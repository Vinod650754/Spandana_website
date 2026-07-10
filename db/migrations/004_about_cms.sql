create table if not exists about_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique default 'primary',
  year_established integer not null,
  introduction text not null,
  mission text not null,
  vision text not null,
  objectives jsonb not null default '[]'::jsonb,
  impact jsonb not null default '[]'::jsonb,
  instagram_url text,
  timeline jsonb not null default '[]'::jsonb,
  future_message text,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table team_members
  add column if not exists member_type text not null default 'student_coordinator',
  add column if not exists department text,
  add column if not exists bio text;

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_name = 'team_members'
      and constraint_name = 'team_members_member_type_check'
  ) then
    alter table team_members drop constraint team_members_member_type_check;
  end if;
end $$;

alter table team_members
  add constraint team_members_member_type_check
  check (member_type in ('faculty_coordinator', 'student_coordinator', 'core_member'));

insert into about_content (
  content_key,
  year_established,
  introduction,
  mission,
  vision,
  objectives,
  impact,
  instagram_url,
  timeline,
  future_message,
  updated_by
)
values (
  'primary',
  2022,
  'SPANDANA is the Social Outreach Club of Sir M. Visvesvaraya Institute of Technology established in 2022 with the mission of encouraging students to actively participate in social service, community development, environmental initiatives, healthcare awareness, and humanitarian activities. Through volunteer-driven programs and outreach campaigns, the club strives to create meaningful and lasting impact in society while developing socially responsible future leaders.',
  'To inspire and mobilize students to serve society through organized outreach programs, community welfare initiatives, environmental action, healthcare awareness, and humanitarian service, while nurturing empathy, responsibility, teamwork, and leadership.',
  'To build a compassionate student community that actively contributes to social progress and becomes a catalyst for sustainable, inclusive, and meaningful change in society.',
  '[
    "Encourage students to participate actively in social service and community development.",
    "Organize outreach programs that address healthcare awareness, environmental responsibility, education, and humanitarian needs.",
    "Develop socially responsible student leaders through volunteer-driven initiatives and teamwork.",
    "Collaborate with communities, institutions, and partners to create measurable social impact.",
    "Promote empathy, civic responsibility, sustainability, and service-minded leadership across campus."
  ]'::jsonb,
  '[
    { "label": "Volunteers", "value": 600, "suffix": "+" },
    { "label": "Events Conducted", "value": 15, "suffix": "+" },
    { "label": "Lives Impacted", "value": 1000, "suffix": "+" }
  ]'::jsonb,
  'https://www.instagram.com/spandana_smvit',
  '[
    { "period": "July 2023", "title": "Blood Donation Drive", "description": "A volunteer-led blood donation initiative supporting healthcare needs and community welfare.", "sortOrder": 1 },
    { "period": "October 2023", "title": "Medical Camp", "description": "A healthcare outreach program focused on accessible medical support and awareness.", "sortOrder": 2 },
    { "period": "October 2023", "title": "Vastradana Drive", "description": "A clothing donation drive extending essential support to communities in need.", "sortOrder": 3 },
    { "period": "March 2024", "title": "Organ Donation Awareness", "description": "An awareness initiative encouraging informed conversations around organ donation.", "sortOrder": 4 },
    { "period": "September 2024", "title": "Cancer Awareness Program", "description": "A public awareness program focused on cancer prevention, early detection, and support.", "sortOrder": 5 },
    { "period": "October 2024", "title": "Awareness Drive", "description": "A social awareness campaign addressing community-facing issues through student participation.", "sortOrder": 6 },
    { "period": "November 2024", "title": "Blood Donation Drive", "description": "A continued healthcare support initiative through organized blood donation.", "sortOrder": 7 },
    { "period": "May 2025", "title": "Blood Donation Drive", "description": "A campus-driven blood donation program strengthening SPANDANA''s healthcare outreach.", "sortOrder": 8 },
    { "period": "June 2025", "title": "Medical Camp", "description": "A medical outreach activity serving community health and wellness needs.", "sortOrder": 9 },
    { "period": "June 2025", "title": "World Environment Day Program", "description": "An environmental action program promoting sustainability and ecological responsibility.", "sortOrder": 10 },
    { "period": "November 2025", "title": "Blood Donation Drive", "description": "A recurring impact initiative focused on saving lives through voluntary blood donation.", "sortOrder": 11 },
    { "period": "November 2025", "title": "Clean-Up Drive", "description": "A community cleanliness initiative encouraging environmental responsibility and civic action.", "sortOrder": 12 },
    { "period": "February 2026", "title": "National Science Day Celebration", "description": "An educational celebration encouraging curiosity, awareness, and student engagement with science.", "sortOrder": 13 }
  ]'::jsonb,
  'Many more initiatives, outreach programs, and community impact activities are planned for the future.',
  'phase-b-about-cms'
)
on conflict (content_key) do update set
  year_established = excluded.year_established,
  introduction = excluded.introduction,
  mission = excluded.mission,
  vision = excluded.vision,
  objectives = excluded.objectives,
  impact = excluded.impact,
  instagram_url = excluded.instagram_url,
  timeline = excluded.timeline,
  future_message = excluded.future_message,
  updated_by = excluded.updated_by,
  updated_at = now();

insert into team_members (
  name,
  role,
  category,
  member_type,
  department,
  photo_url,
  social,
  featured,
  sort_order
)
values (
  'Dr. Rashmi K. V.',
  'Faculty Coordinator',
  'faculty',
  'faculty_coordinator',
  'Biotechnology',
  null,
  '{}'::jsonb,
  true,
  0
)
on conflict do nothing;
