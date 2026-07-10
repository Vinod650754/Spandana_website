alter table homepage_content
  add column if not exists content_key text not null default 'primary',
  add column if not exists featured_sections jsonb not null default '[]'::jsonb,
  add column if not exists hero_background jsonb not null default '{}'::jsonb,
  add column if not exists updated_by text;

create unique index if not exists homepage_content_key_idx
  on homepage_content (content_key);

insert into homepage_content (
  content_key,
  hero,
  impact,
  about,
  featured_sections,
  hero_background,
  testimonials,
  updated_by
)
values (
  'primary',
  '{
    "title": "SPANDANA",
    "subtitle": "Social Outreach Club of Sir M. Visvesvaraya Institute of Technology",
    "body": "SPANDANA is the Social Outreach Club of Sir M. Visvesvaraya Institute of Technology dedicated to creating positive change through volunteerism, community service, environmental initiatives, educational support programs, and social impact activities. We empower students to become responsible leaders who contribute meaningfully towards building a better society.",
    "buttons": [
      { "label": "Explore Events", "url": "/events", "variant": "primary" },
      { "label": "Join Our Mission", "url": "/contact", "variant": "secondary" }
    ],
    "rotatingLines": [
      "Serving Society, Inspiring Change",
      "Empowering Communities Through Action",
      "Creating Meaningful Social Impact",
      "Inspiring Students To Lead Change",
      "Building Better Futures Together"
    ],
    "chips": [
      "Community Outreach",
      "Environmental Action",
      "Student Leadership"
    ]
  }'::jsonb,
  '[
    { "label": "Lives Impacted", "value": 5000, "suffix": "+" },
    { "label": "Events Conducted", "value": 150, "suffix": "+" },
    { "label": "Student Volunteers", "value": 800, "suffix": "+" },
    { "label": "Communities Reached", "value": 20, "suffix": "+" }
  ]'::jsonb,
  '{}'::jsonb,
  '[
    {
      "title": "Community Outreach",
      "description": "Connecting students with communities through meaningful social service initiatives and welfare programs."
    },
    {
      "title": "Environmental Action",
      "description": "Promoting sustainability through tree plantation drives, awareness campaigns, and environmental conservation activities."
    },
    {
      "title": "Student Leadership",
      "description": "Developing socially responsible leaders through volunteer experiences, teamwork, and community engagement."
    }
  ]'::jsonb,
  '{
    "type": "reactbits",
    "effects": [
      "Liquid Ether Background",
      "Pixel Trail Cursor",
      "Glassmorphism Elements",
      "Border Glow Components",
      "Animated Content",
      "Bounce Cards",
      "Shiny Text",
      "Text Type Animations"
    ]
  }'::jsonb,
  '[]'::jsonb,
  'phase-b-homepage-cms'
)
on conflict (content_key) do update set
  hero = excluded.hero,
  impact = excluded.impact,
  featured_sections = excluded.featured_sections,
  hero_background = excluded.hero_background,
  updated_by = excluded.updated_by,
  updated_at = now();
