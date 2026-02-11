-- Rename 'ITA' to 'ITS' in the entities table
UPDATE entities
SET name = 'ITS'
WHERE name = 'ITA';
