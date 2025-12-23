import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

// ===== DB1: database chính của web =====
export const db1Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// ===== DB3: database sync trung gian =====

// ===== DB2: database của web2 (tùy chỉnh qua env) =====
export const db2Pool = mysql.createPool({
  host: process.env.DB2_HOST || process.env.DB_HOST,
  user: process.env.DB2_USER || process.env.DB_USER,
  password: process.env.DB2_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB2_NAME || process.env.DB_NAME,
  port: process.env.DB2_PORT ? Number(process.env.DB2_PORT) : process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Alias used by worker code for the sync DB


// Test nhanh DB1
export async function testConnection() {
  const conn = await db1Pool.getConnection();
  console.log("DB1 connected");
  conn.release();
}
