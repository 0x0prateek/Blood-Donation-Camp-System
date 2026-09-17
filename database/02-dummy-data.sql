
-- ============================================================
-- DUMMY DATA FOR DEMO PURPOSES
-- ============================================================

INSERT INTO `donors` (`donor_name`, `mobile`, `whatsapp`, `email`, `address`, `blood_group`, `gender`, `date_of_birth`, `last_donation_date`, `status`) VALUES
('John Doe', '0712345678', '0712345678', 'john@example.com', '123 Main St, Colombo', 'O+', 'Male', '1990-05-15', '2023-11-20', 'Active'),
('Jane Smith', '0779876543', '0779876543', 'jane@example.com', '45 Park Ave, Kandy', 'A-', 'Female', '1985-08-22', '2024-01-10', 'Active'),
('Alex Johnson', '0721112222', NULL, 'alex@example.com', 'Galle Road, Galle', 'B+', 'Male', '1995-12-05', '2023-09-15', 'Active'),
('Emily Davis', '0783334444', '0783334444', 'emily@example.com', 'Temple Road, Jaffna', 'AB+', 'Female', '1992-03-30', NULL, 'Active'),
('Michael Brown', '0755556666', '0755556666', 'michael@example.com', 'Flower Road, Colombo', 'O-', 'Male', '1988-11-11', '2024-02-28', 'Inactive');

INSERT INTO `blood_camps` (`title`, `camp_date`, `start_time`, `end_time`, `location`, `description`, `budget_amount`, `status`) VALUES
('Annual Mega Blood Drive', '2024-05-15', '09:00:00', '16:00:00', 'Town Hall, Colombo', 'Annual community blood donation drive organized by the Lions Club.', 50000.00, 'Upcoming'),
('University Blood Camp', '2024-03-10', '08:30:00', '14:00:00', 'University of Peradeniya', 'Blood donation camp organized by the students union.', 25000.00, 'Completed'),
('Corporate Donation Day', '2024-06-20', '10:00:00', '15:00:00', 'Tech Park, Malabe', 'Corporate blood donation day for tech employees.', 75000.00, 'Upcoming');

