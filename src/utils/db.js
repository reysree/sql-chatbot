import mysql from "mysql2/promise";
import { getSelectedDatabase } from "@/app/api/set-db/route";

export async function getDatabaseConnection() {
  const database = getSelectedDatabase(); // ✅ Get latest DB dynamically

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "ai", // Fallback to a default DB if empty
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}
