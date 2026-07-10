-- Remove NOT NULL constraints from legacy columns

ALTER TABLE team_members
ALTER COLUMN role DROP NOT NULL;

ALTER TABLE team_members
ALTER COLUMN category DROP NOT NULL;

-- Optional defaults
ALTER TABLE team_members
ALTER COLUMN role DROP DEFAULT;

ALTER TABLE team_members
ALTER COLUMN category DROP DEFAULT;