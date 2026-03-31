USE campushub;

ALTER TABLE clubs
  ADD COLUMN about_us TEXT NULL,
  ADD COLUMN members_json JSON NULL;

ALTER TABLE departments
  ADD COLUMN about_us TEXT NULL,
  ADD COLUMN faculty_json JSON NULL;

ALTER TABLE events
  ADD COLUMN volunteer_slots INT NOT NULL DEFAULT 0;
