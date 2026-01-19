-- Add Jennifer's Paydy to calendar_by_date
INSERT INTO calendar_by_date (id, user_id, date, title, category, created_at)
VALUES 
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-11-07', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-12-08', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-12-23', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-01-08', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-01-23', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-02-06', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-02-23', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-03-06', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-03-23', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-04-08', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-04-23', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-05-08', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-05-22', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-06-08', 'Jennifer''s Paydy', 'Payday', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-06-23', 'Jennifer''s Paydy', 'Payday', NOW())
ON CONFLICT DO NOTHING;

