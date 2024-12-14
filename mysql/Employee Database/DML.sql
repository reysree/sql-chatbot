INSERT INTO Employee (eid, name, age, dept_id)
VALUES
    (101, 'John Doe', 30, 2),
    (102, 'Jane Smith', 25, 1),
    (103, 'Alice Johnson', 35, 3),
    (104, 'Bob Brown', 40, 4);

INSERT INTO Address (address_id, eid, street, city, state, postal_code, country, address_type)
VALUES
    (1, 101, '123 Elm Street', 'San Francisco', 'CA', '94107', 'USA', 'Home'),
    (2, 101, '456 Oak Avenue', 'San Francisco', 'CA', '94107', 'USA', 'Work'),
    (3, 102, '789 Pine Lane', 'New York', 'NY', '10001', 'USA', 'Home'),
    (4, 103, '321 Maple Drive', 'Chicago', 'IL', '60614', 'USA', 'Home');
	
	
	
INSERT INTO Department (dept_id, detp_name)
VALUES
	(1, 'Engieering'),
	(2, 'Health Informatics'),
	(3,'Operations'),
	(4, 'Human Resources')