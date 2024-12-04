import mysql from "mysql2/promise";

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "AI",
  port: process.env.DB_PORT || 3306, // Add the port configuration
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
