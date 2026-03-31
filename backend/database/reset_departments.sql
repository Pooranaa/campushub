USE campushub;

DELETE FROM departments;
ALTER TABLE departments AUTO_INCREMENT = 1;

INSERT INTO departments (name, description) VALUES
('CSE', 'Computer Science and Engineering department'),
('ECE', 'Electronics and Communication Engineering department'),
('EEE', 'Electrical and Electronics Engineering department'),
('IT', 'Information Technology department'),
('Chemical', 'Chemical Engineering department'),
('Civil', 'Civil Engineering department'),
('BME', 'Biomedical Engineering department'),
('Mechanical', 'Mechanical Engineering department');
