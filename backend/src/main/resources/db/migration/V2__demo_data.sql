-- Hostel Management System - Demo data (Flyway V2)
-- NOTE: the admin login is NOT seeded here. It is created at application startup
-- from ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD (backend/.env) - see AdminSeeder.
-- DB login credentials no longer live in this file or in git.

-- ---------------- Students (16) ----------------
INSERT INTO students (student_id, full_name, email, phone, course, year_of_study, guardian_name, guardian_contact, address, admission_date, status) VALUES
('STU-2026-001', 'Aarav Sharma',   'aarav.sharma@mail.com',  '9876500001', 'B.Tech Computer Science', 3, 'Rajesh Sharma',  '9876500011', '12, MG Road, Pune',        '2026-01-10', 'ACTIVE'),
('STU-2026-002', 'Diya Patel',     'diya.patel@mail.com',    '9876500002', 'B.Tech Electronics',      2, 'Priya Patel',    '9876500012', '45, Park Street, Mumbai',  '2026-01-12', 'ACTIVE'),
('STU-2026-003', 'Kabir Mehta',    'kabir.mehta@mail.com',   '9876500003', 'B.Tech Mechanical',       2, 'Amit Mehta',     '9876500013', '8, Lake View, Nashik',     '2026-02-05', 'ACTIVE'),
('STU-2026-004', 'Ananya Iyer',    'ananya.iyer@mail.com',   '9876500004', 'B.Sc Physics',            3, 'Suresh Iyer',    '9876500014', '23, College Road, Chennai','2026-02-18', 'ACTIVE'),
('STU-2026-005', 'Arjun Nair',     'arjun.nair@mail.com',    '9876500005', 'B.Tech Computer Science', 2, 'Nair Raghavan',  '9876500015', '9, Hill Side, Kochi',      '2026-03-02', 'ACTIVE'),
('STU-2026-006', 'Meera Kulkarni', 'meera.k@mail.com',       '9876500006', 'BBA',                     2, 'Sanjay Kulkarni','9876500016', '56, River Bank, Aurangabad','2026-03-15','ACTIVE'),
('STU-2026-007', 'Rohan Das',      'rohan.das@mail.com',     '9876500007', 'B.Tech Civil',            3, 'Subrata Das',    '9876500017', '17, New Colony, Kolkata',  '2026-04-01', 'ACTIVE'),
('STU-2026-008', 'Ishita Bose',    'ishita.bose@mail.com',   '9876500008', 'B.Com',                   1, 'Anil Bose',      '9876500018', '31, Market Road, Delhi',   '2026-04-20', 'ACTIVE'),
('STU-2026-009', 'Vikram Reddy',   'vikram.reddy@mail.com',  '9876500009', 'B.Tech Computer Science', 3, 'Prakash Reddy',  '9876500019', '72, Temple Street, Hyderabad','2026-05-06','ACTIVE'),
('STU-2026-010', 'Priya Menon',    'priya.menon@mail.com',   '9876500010', 'B.Tech Electronics',      4, 'Menon Balan',    '9876500020', '14, Beach Road, Goa',      '2026-01-08', 'ACTIVE'),
('STU-2026-011', 'Aditya Rao',     'aditya.rao@mail.com',    '9876500011', 'B.Tech Mechanical',       3, 'Rao Krishnan',   '9876500021', '6, Garden Lane, Nagpur',   '2026-01-09', 'ACTIVE'),
('STU-2026-012', 'Sneha Verma',    'sneha.verma@mail.com',   '9876500012', 'B.A English',             2, 'Ramesh Verma',   '9876500022', '88, Old City, Jaipur',     '2026-06-14', 'ACTIVE'),
('STU-2026-013', 'Karan Singh',    'karan.singh@mail.com',   '9876500013', 'B.Tech Computer Science', 1, 'Harpreet Singh', '9876500023', '25, Cantt Road, Ludhiana', '2026-07-01', 'ACTIVE'),
('STU-2026-014', 'Nisha Gupta',    'nisha.gupta@mail.com',   '9876500014', 'B.Sc Chemistry',          2, 'Vijay Gupta',    '9876500024', '39, Station Road, Bhopal', '2026-07-02', 'ACTIVE'),
('STU-2026-015', 'Rahul Khanna',   'rahul.khanna@mail.com',    '9876500015', 'B.Tech Electrical',       2, 'Sanjeev Khanna', '9876500025', '91, North Avenue, Chandigarh','2026-08-11','INACTIVE'),
('STU-2026-016', 'Tanvi Joshi',    'tanvi.joshi@mail.com',     '9876500016', 'BBA',                     3, 'Milind Joshi',   '9876500026', '5, South End, Surat',      '2026-08-12', 'ACTIVE');

-- ---------------- Rooms (7) ----------------
INSERT INTO rooms (room_number, floor_no, room_type, capacity, monthly_fee, status) VALUES
('101', 1, 'SINGLE', 1, 6000.00, 'AVAILABLE'),
('102', 1, 'SINGLE', 1, 6000.00, 'AVAILABLE'),
('201', 2, 'DOUBLE', 2, 4500.00, 'AVAILABLE'),
('202', 2, 'DOUBLE', 2, 4500.00, 'AVAILABLE'),
('301', 3, 'TRIPLE', 3, 3500.00, 'AVAILABLE'),
('302', 3, 'TRIPLE', 3, 3500.00, 'MAINTENANCE'),
('401', 4, 'QUAD',   4, 3000.00, 'AVAILABLE');

-- ---------------- Allocations (9 active + 2 checked out) ----------------
INSERT INTO allocations (student_id, room_id, allotment_date, checkout_date, status) VALUES
((SELECT id FROM students WHERE student_id = 'STU-2026-001'), (SELECT id FROM rooms WHERE room_number = '101'), '2026-01-10', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-002'), (SELECT id FROM rooms WHERE room_number = '201'), '2026-01-12', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-003'), (SELECT id FROM rooms WHERE room_number = '201'), '2026-02-05', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-004'), (SELECT id FROM rooms WHERE room_number = '301'), '2026-02-18', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-005'), (SELECT id FROM rooms WHERE room_number = '301'), '2026-03-02', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-006'), (SELECT id FROM rooms WHERE room_number = '301'), '2026-03-15', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-007'), (SELECT id FROM rooms WHERE room_number = '202'), '2026-04-01', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-008'), (SELECT id FROM rooms WHERE room_number = '401'), '2026-04-20', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-009'), (SELECT id FROM rooms WHERE room_number = '401'), '2026-05-06', NULL, 'ACTIVE'),
((SELECT id FROM students WHERE student_id = 'STU-2026-010'), (SELECT id FROM rooms WHERE room_number = '102'), '2026-01-08', '2026-09-30', 'CHECKED_OUT'),
((SELECT id FROM students WHERE student_id = 'STU-2026-011'), (SELECT id FROM rooms WHERE room_number = '302'), '2026-01-09', '2026-08-15', 'CHECKED_OUT');

-- ---------------- Fees (15 records: mix of paid / partial / pending) ----------------
INSERT INTO fees (student_id, amount, due_date, period) VALUES
((SELECT id FROM students WHERE student_id = 'STU-2026-001'), 21000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-002'), 18000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-003'), 18000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-004'), 21000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-005'), 21000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-006'), 21000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-007'), 18000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-008'), 12000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-009'), 12000.00, '2026-09-30', 'Jul - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-010'), 18000.00, '2026-08-31', 'Feb - Jul 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-011'), 21000.00, '2026-08-31', 'Feb - Jul 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-012'), 21000.00, '2026-10-31', 'Aug - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-013'), 18000.00, '2026-10-31', 'Aug - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-014'), 18000.00, '2026-10-31', 'Aug - Dec 2026'),
((SELECT id FROM students WHERE student_id = 'STU-2026-015'), 15000.00, '2026-10-31', 'Aug - Dec 2026');

-- ---------------- Payments ----------------
INSERT INTO payments (fee_id, amount, payment_date, method, reference, note) VALUES
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-001')), 10000.00, '2026-08-15', 'CASH',       'CASH-260815-01', 'First instalment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-001')), 11000.00, '2026-09-10', 'UPI',        'UPI-260910-01',  'Balance paid'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-002')), 18000.00, '2026-08-20', 'BANK_TRANSFER', 'NEFT-260820-01', 'Full payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-003')),  9000.00, '2026-09-05', 'CASH',       'CASH-260905-01', 'Partial payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-005')),  5000.00, '2026-09-12', 'UPI',        'UPI-260912-01',  'Partial payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-006')), 21000.00, '2026-08-25', 'BANK_TRANSFER', 'NEFT-260825-01', 'Full payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-008')), 12000.00, '2026-09-01', 'CASH',       'CASH-260901-01', 'Full payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-009')),  7000.00, '2026-09-18', 'UPI',        'UPI-260918-01',  'Partial payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-010')), 10000.00, '2026-06-15', 'CASH',       'CASH-260615-01', 'First instalment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-010')),  8000.00, '2026-07-15', 'UPI',        'UPI-260715-01',  'Second instalment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-011')), 10000.00, '2026-07-20', 'CASH',       'CASH-260720-01', 'Partial payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-013')),  9000.00, '2026-10-02', 'UPI',        'UPI-261002-01',  'Partial payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-014')), 18000.00, '2026-10-05', 'BANK_TRANSFER', 'NEFT-261005-01', 'Full payment'),
((SELECT id FROM fees WHERE student_id = (SELECT id FROM students WHERE student_id='STU-2026-015')), 15000.00, '2026-10-08', 'CASH',       'CASH-261008-01', 'Full payment');

-- ---------------- Complaints (5) ----------------
INSERT INTO complaints (complaint_id, student_id, room_id, category, description, priority, status) VALUES
('CMP-2026-001', (SELECT id FROM students WHERE student_id = 'STU-2026-002'), (SELECT id FROM rooms WHERE room_number = '201'), 'Plumbing',   'Water tap in the washroom is leaking continuously.', 'HIGH',   'OPEN'),
('CMP-2026-002', (SELECT id FROM students WHERE student_id = 'STU-2026-004'), (SELECT id FROM rooms WHERE room_number = '301'), 'Electricity','Tube light near the study table is not working.',    'MEDIUM', 'IN_PROGRESS'),
('CMP-2026-003', (SELECT id FROM students WHERE student_id = 'STU-2026-007'), (SELECT id FROM rooms WHERE room_number = '202'), 'Noise',      'Loud music from neighbouring room after 11 PM.',     'LOW',    'RESOLVED'),
('CMP-2026-004', (SELECT id FROM students WHERE student_id = 'STU-2026-008'), (SELECT id FROM rooms WHERE room_number = '401'), 'Cleanliness','Common area on floor 4 has not been cleaned.',       'MEDIUM', 'OPEN'),
('CMP-2026-005', (SELECT id FROM students WHERE student_id = 'STU-2026-009'), (SELECT id FROM rooms WHERE room_number = '401'), 'Wi-Fi',      'Internet goes down daily between 8 PM and 10 PM.',   'HIGH',   'IN_PROGRESS');
