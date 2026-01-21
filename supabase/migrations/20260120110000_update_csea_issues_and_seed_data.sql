-- Update csea_issues with missing columns
ALTER TABLE csea_issues ADD COLUMN IF NOT EXISTS member_name TEXT;
ALTER TABLE csea_issues ADD COLUMN IF NOT EXISTS work_location TEXT;
ALTER TABLE csea_issues ADD COLUMN IF NOT EXISTS involved_parties TEXT;

-- Seed Stewards
INSERT INTO csea_stewards (name) VALUES 
('Caden Stearns'),
('Christopher Crump'),
('Karla Toscano'),
('Matthew Korn')
ON CONFLICT DO NOTHING;

-- Seed Issues from Google Sheet
INSERT INTO csea_issues (user_id, issue_date, member_name, work_location, description, involved_parties, steward, status, issue_type) VALUES 
('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-04-19', 'Norma Fuentes', 'Compton Ave Elementary', 'SAA talking down to member and complaining when doing what was asked by administrator and not telling her. Retaliation was taken when member complained to administrator about SAA. Work was compromised when a hand-held scanner cord was cut during member''s lunch period.', 'SAA', 'Caden Stearns', 'Open', 'Grievance'),

('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-06-02', 'Mary Rose Charazrian', 'MiSiS', 'Mistreatment by supervisor', 'Supervisor and Director', 'Christopher Crump', 'Open', 'Gripe'),

('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-06-04', 'Ester Cid', 'HR', 'Salary Allocations', '', 'Christopher Crump', 'Open', 'Complaint'),

('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-06-06', 'Isabel Ramierz', 'Elizabeth Learning Center', 'Office Technician position being cut. Involuntary transfer. Told member to call Karla Toscano and ask what other vacancies there are.', 'Administrator', 'Karla Toscano', 'Open', 'Gripe'),

('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-06-21', 'Victor Lopez', 'Beaudry', 'Meeting is called for Monday, June 24th at 3 pm to discuss working out of classification, but in reality is working duties as assigned.', 'Multiple People', 'Caden Stearns', 'Open', 'Gripe'),

('289cccb9-9ab7-4ee9-b456-98e70babe58b', '2024-12-11', 'Jennifer Burbank', 'Beaudry', 'Working out of classification; not being able to have work experience credited; needing forms to be signed off to be able to promote to validate work experience', 'Multiple People', 'Matthew Korn', 'Open', 'Gripe')
ON CONFLICT DO NOTHING;
