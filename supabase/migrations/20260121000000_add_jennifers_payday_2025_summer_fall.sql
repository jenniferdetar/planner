-- Add missing Jennifer's Payday dates from the 2025-2026 semi-monthly calendar
INSERT INTO calendar_by_date (id, user_id, date, title, category, created_at)
VALUES 
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-07-08', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-07-23', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-08-08', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-08-22', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-09-08', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-09-23', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-10-08', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-10-23', 'Jennifer''s Payday', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-11-21', 'Jennifer''s Payday', 'Payday', NOW())
ON CONFLICT DO NOTHING;
