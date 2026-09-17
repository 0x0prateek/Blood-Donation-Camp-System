USE `blood_donor_system`;

INSERT INTO `message_logs` (`donor_id`, `mobile`, `message_type`, `message`, `status`, `sent_at`) VALUES
(1, '0711111101', 'WhatsApp', 'Please attend our camp tomorrow.', 'Sent', '2024-05-20 09:00:00'),
(2, '0711111102', 'WhatsApp', 'Please attend our camp tomorrow.', 'Sent', '2024-05-20 09:00:01'),
(3, '0711111103', 'WhatsApp', 'Please attend our camp tomorrow.', 'Failed', '2024-05-20 09:00:02'),
(4, '0711111104', 'WhatsApp', 'Please attend our camp tomorrow.', 'Sent', '2024-05-20 09:00:03'),
(5, '0711111105', 'SMS', 'Please attend our camp tomorrow.', 'Sent', '2024-05-20 09:00:04'),
(11, '0711111111', 'WhatsApp', 'Urgent O+ blood needed at General Hospital.', 'Sent', '2024-04-05 10:00:00'),
(12, '0711111112', 'WhatsApp', 'Urgent O+ blood needed at General Hospital.', 'Sent', '2024-04-05 10:00:01'),
(13, '0711111113', 'SMS', 'Urgent O+ blood needed at General Hospital.', 'Sent', '2024-04-05 10:00:02');
