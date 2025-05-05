import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// Skapa en databas som sparas till disk
const sqlite = new Database('./database.db');

// Skapa drizzle-instansen
export const db = drizzle(sqlite, { schema });

// Se till att tabellerna skapas om de inte redan finns
export function initializeTables() {
  console.log('Initializing database tables...');
  
  // Användartabell
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);
  
  // Batch-tabell
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_number TEXT NOT NULL UNIQUE,
      article_number TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      total_weight INTEGER NOT NULL,
      inventored_weight INTEGER,
      status TEXT NOT NULL DEFAULT 'not_started',
      updated_at TEXT,
      user_id INTEGER,
      user_name TEXT
    )
  `);
  
  console.log('Database tables initialized');
}
