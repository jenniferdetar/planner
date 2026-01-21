-- Migration to add Point of Contact and update Karla Toscano's role
-- 1. Add point_of_contact column to csea_issues
ALTER TABLE csea_issues ADD COLUMN IF NOT EXISTS point_of_contact TEXT;

-- 2. Update existing records: move Karla Toscano from steward to point_of_contact
UPDATE csea_issues 
SET point_of_contact = 'Karla Toscano', 
    steward = NULL 
WHERE steward = 'Karla Toscano';

-- 3. Remove Karla Toscano from csea_stewards
DELETE FROM csea_stewards WHERE name = 'Karla Toscano';
