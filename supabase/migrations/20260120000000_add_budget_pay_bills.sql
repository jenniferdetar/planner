-- Add Budget/Pay Bills events 3 days before Jennifer's Payday
INSERT INTO calendar_by_date (id, user_id, date, title, category, created_at)
VALUES 
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-11-04', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-12-05', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2025-12-20', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-01-05', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-01-20', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-02-03', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-02-20', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-03-03', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-03-20', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-04-05', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-04-20', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-05-05', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-05-19', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-06-05', 'Budget/Pay Bills', 'Budget', NOW()),
  (gen_random_uuid(), '289cccb9-9ab7-4ee9-b456-98e70babe58b', '2026-06-20', 'Budget/Pay Bills', 'Budget', NOW())
ON CONFLICT DO NOTHING;
