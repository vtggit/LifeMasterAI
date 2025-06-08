import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create a SQLite database connection
const sqlite = new Database('/workspace/LifeMasterAI/dev.db', { verbose: console.log });

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

// Create a drizzle instance
export const db = drizzle(sqlite, { schema });

// Test the connection
const test = sqlite.prepare('SELECT * FROM stores WHERE userId = ?').all(1);
console.log('Test query result:', test);