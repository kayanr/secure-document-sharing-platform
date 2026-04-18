-- Dev seed data — run manually to reset the database to a known state
-- All passwords are BCrypt hashes of: password123
--
-- Usage:
--   docker exec -i securedoc-mysql mysql -u flixxer_user -p securedoc_db < backend/src/main/resources/dev-seed.sql
--
-- Credentials after seeding:
--   user@securedoc.com     / password123  (ROLE_USER)
--   admin@securedoc.com    / password123  (ROLE_ADMIN)
--   recipient@securedoc.com / password123 (ROLE_USER — for sharing tests)

-- Clear existing data (order matters due to foreign keys)
DELETE FROM share_permissions;
DELETE FROM documents;
DELETE FROM users;

-- Seed users
INSERT INTO users (full_name, email, password, role, created_at) VALUES
  ('Dev User',       'user@securedoc.com',      '$2a$10$ofmpX45MhJazjs.94YgS1OCGejProUWFR2grh0HTZqYAJUAE40L6G', 'USER',  NOW()),
  ('Dev Admin',      'admin@securedoc.com',     '$2a$10$ofmpX45MhJazjs.94YgS1OCGejProUWFR2grh0HTZqYAJUAE40L6G', 'ADMIN', NOW()),
  ('Dev Recipient',  'recipient@securedoc.com', '$2a$10$ofmpX45MhJazjs.94YgS1OCGejProUWFR2grh0HTZqYAJUAE40L6G', 'USER',  NOW());

-- Seed sample documents (owned by user@securedoc.com)
-- NOTE: these are metadata-only records — no actual files exist on disk.
-- They will appear in the documents list but cannot be downloaded.
-- To test downloads, upload a real file via the UI after seeding.
INSERT INTO documents (file_name, file_path, file_size, content_type, owner_id, uploaded_at)
SELECT
  'sample-report.pdf',
  'uploads/sample-report.pdf',
  20480,
  'application/pdf',
  id,
  NOW()
FROM users WHERE email = 'user@securedoc.com';

INSERT INTO documents (file_name, file_path, file_size, content_type, owner_id, uploaded_at)
SELECT
  'project-notes.txt',
  'uploads/project-notes.txt',
  4096,
  'text/plain',
  id,
  NOW()
FROM users WHERE email = 'user@securedoc.com';
