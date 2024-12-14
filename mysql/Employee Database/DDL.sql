CREATE DATABASE AI

CREATE TABLE Employee (
     eid INT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     age INT NOT NULL,
     dept_id INT,
      Add other fields as needed
     FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
 );


 CREATE TABLE Department (
     dept_id INT PRIMARY KEY AUTO_INCREMENT,
     dept_name VARCHAR(100) NOT NULL
 );


 CREATE TABLE Address (
     address_id INT PRIMARY KEY AUTO_INCREMENT,
     eid INT NOT NULL,
     street VARCHAR(255),
     city VARCHAR(100),
     state VARCHAR(100),
     postal_code VARCHAR(20),
     country VARCHAR(100),
     address_type ENUM('Home', 'Work', 'Other'),
     FOREIGN KEY (eid) REFERENCES Employee(eid)
 );