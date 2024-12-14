/*CREATE DATABASE INVOICE*/


CREATE TABLE Vendors (
    VendorID VARCHAR(255) PRIMARY KEY,
    VendorName VARCHAR(255),
    ContactName VARCHAR(255),
    ContactEmail VARCHAR(255),
    Address VARCHAR(255),
    PhoneNumber VARCHAR(255),
    TaxID VARCHAR(255)
);


CREATE TABLE Users (
    UserID VARCHAR(255) PRIMARY KEY,
    Username VARCHAR(255),
    Email VARCHAR(255),
    Role VARCHAR(255),
    PasswordHash VARCHAR(255)
);


CREATE TABLE Invoices (
    InvoiceID VARCHAR(255) PRIMARY KEY,
    VendorID VARCHAR(255),
    InvoiceDate VARCHAR(255),
    DueDate VARCHAR(255),
    PaymentDate VARCHAR(255),
    TotalAmount VARCHAR(255),
    Status VARCHAR(255),
    ApprovedBy VARCHAR(255),
    FOREIGN KEY (VendorID) REFERENCES Vendors(VendorID),
    FOREIGN KEY (ApprovedBy) REFERENCES Users(UserID)
);


CREATE TABLE InvoiceItems (
    InvoiceItemID VARCHAR(255) PRIMARY KEY,
    InvoiceID VARCHAR(255),
    Description VARCHAR(255),
    Quantity VARCHAR(255),
    UnitPrice VARCHAR(255),
    TotalPrice VARCHAR(255),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);


CREATE TABLE Payments (
    PaymentID VARCHAR(255) PRIMARY KEY,
    InvoiceID VARCHAR(255),
    PaymentDate VARCHAR(255),
    PaymentMethod VARCHAR(255),
    AmountPaid VARCHAR(255),
    ConfirmationNumber VARCHAR(255),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);
