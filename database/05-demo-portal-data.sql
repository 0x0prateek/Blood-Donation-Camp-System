-- ============================================================
-- DOTLIFE PORTAL DEMO DATA
-- 120 donor-portal users and 120 blood requests.
-- Idempotent: safe to apply to an existing development database.
-- Do not use these demo credentials in production.
-- ============================================================

USE `blood_donor_system`;

INSERT IGNORE INTO `users`
    (`name`, `username`, `email`, `mobile`, `blood_group`, `password`, `role`, `status`)
WITH RECURSIVE sequence_numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM sequence_numbers WHERE n < 120
)
SELECT
    CONCAT('Demo Portal User ', n),
    CONCAT('demo_user_', LPAD(n, 3, '0')),
    CONCAT('demo.user.', LPAD(n, 3, '0'), '@dotlife.test'),
    CONCAT('0712', LPAD(n, 6, '0')),
    ELT(((n - 1) MOD 8) + 1, 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    '$2b$10$5j78HUlYxqySs27KMBC3wu5vA346LWNDzBrC0566I3TeUAdz0ws2W',
    'user',
    'Active'
FROM sequence_numbers;

INSERT INTO `blood_requests`
    (`user_id`, `requester_name`, `contact_mobile`, `blood_group`, `units_needed`, `hospital_name`, `location`, `urgency`, `details`, `status`)
SELECT
    u.id,
    u.name,
    u.mobile,
    u.blood_group,
    ((u.id - 1) MOD 3) + 1,
    ELT(((u.id - 1) MOD 4) + 1, 'National Hospital', 'General Hospital', 'Teaching Hospital', 'District Hospital'),
    ELT(((u.id - 1) MOD 4) + 1, 'Colombo', 'Kandy', 'Galle', 'Jaffna'),
    ELT(((u.id - 1) MOD 4) + 1, 'Low', 'Moderate', 'High', 'Critical'),
    'Development seed request for admin workflow testing.',
    ELT(((u.id - 1) MOD 3) + 1, 'Open', 'Matched', 'Closed')
FROM users u
WHERE u.username LIKE 'demo_user_%'
  AND NOT EXISTS (
      SELECT 1 FROM blood_requests br
      WHERE br.user_id = u.id
        AND br.details = 'Development seed request for admin workflow testing.'
  );