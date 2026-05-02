import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

function buildPoolConfig() {
  const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

  if (mysqlUrl) {
    const url = new URL(mysqlUrl);
    const sslEnabled = process.env.DB_SSL === "true";

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      connectionLimit: 10,
      ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {})
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
  };
}

export const pool = mysql.createPool(buildPoolConfig());
