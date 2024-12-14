-- VENDORS

INSERT INTO Vendors (VendorID, VendorName, ContactName, ContactEmail, Address, PhoneNumber, TaxID) VALUES
('V001', 'Vendor A', 'Alice', 'alice@vendora.com', '123 Main St, City A', '1234567890', 'TAX123'),
('V002', 'Vendor B', 'Bob', 'bob@vendorb.com', '456 Elm St, City B', '9876543210', 'TAX456'),
('V003', 'Vendor C', 'Charlie', 'charlie@vendorc.com', '789 Pine St, City C', '5647382910', 'TAX789'),
('V004', 'Vendor D', 'Diana', 'diana@vendord.com', '321 Oak St, City D', '1122334455', 'TAX321'),
('V005', 'Vendor E', 'Eve', 'eve@vendore.com', '654 Cedar St, City E', '6677889900', 'TAX654');


-- USERS

INSERT INTO Users (UserID, Username, Email, Role, PasswordHash) VALUES
('U001', 'JohnDoe', 'john.doe@company.com', 'Manager', 'hash123'),
('U002', 'JaneSmith', 'jane.smith@company.com', 'Accountant', 'hash456'),
('U003', 'SamBrown', 'sam.brown@company.com', 'Auditor', 'hash789'),
('U004', 'EmmaGreen', 'emma.green@company.com', 'Analyst', 'hash321'),
('U005', 'LiamWhite', 'liam.white@company.com', 'Supervisor', 'hash654');


-- INVOICES

INSERT INTO Invoices (InvoiceID, VendorID, InvoiceDate, DueDate, PaymentDate, TotalAmount, Status, ApprovedBy) VALUES
('I001', 'V001', '2024-12-01', '2024-12-15', NULL, '30000', 'Pending', 'U001'),
('I002', 'V002', '2024-12-02', '2024-12-20', '2024-12-10', 'Thirty Thousand', 'Paid', 'U002'),
('I003', 'V003', '2024-12-03', '2024-12-18', NULL, '15000', 'Pending', 'U003'),
('I004', 'V004', '2024-12-04', '2024-12-25', '2024-12-21', 'Ten Thousand', 'Paid', 'U004'),
('I005', 'V005', '2024-12-05', '2024-12-22', NULL, '5000', 'Pending', 'U005');


-- INVOICEITEMS

INSERT INTO InvoiceItems (InvoiceItemID, InvoiceID, Description, Quantity, UnitPrice, TotalPrice) VALUES
('IT001', 'I001', 'Item A', '10', '1000', '10000'),
('IT002', 'I001', 'Item B', '5', '2000', 'Ten Thousand'),
('IT003', 'I002', 'Item C', '3', '5000', 'Fifteen Thousand'),
('IT004', 'I003', 'Item D', '2', '7500', '15000'),
('IT005', 'I004', 'Item E', '1', 'Ten Thousand', 'Ten Thousand');


-- PAYMENTS

INSERT INTO Payments (PaymentID, InvoiceID, PaymentDate, PaymentMethod, AmountPaid, ConfirmationNumber) VALUES
('P001', 'I002', '2024-12-10', 'Bank Transfer', '30000', 'CONF123'),
('P002', 'I001', '2024-12-15', 'Credit Card', 'Thirty Thousand', 'CONF456'),
('P003', 'I003', '2024-12-19', 'Cheque', '15000', 'CONF789'),
('P004', 'I004', '2024-12-21', 'Cash', 'Ten Thousand', 'CONF321'),
('P005', 'I005', '2024-12-23', 'Bank Transfer', '5000', 'CONF654');
