




import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
// Import schema directly
const fs = await import('fs');
const path = await import('path');

const filePath = path.resolve('./server/storage/schema.js');
console.log(`Loading schema from: ${filePath}`);
let schemaModule;
try {
  schemaModule = await import('./server/storage/schema.js');
} catch (err) {
  console.error('Error importing schema:', err);
}

const sqlite = new Database('/workspace/LifeMasterAI/dev.db', { verbose: console.log });
sqlite.exec('PRAGMA foreign_keys = ON;');
const db = drizzle(sqlite);

(async () => {
  try {
    console.log('Testing database connection...');

    // Test direct SQL query
    const rawStoresResult = sqlite.prepare('SELECT * FROM stores WHERE userId = 1').all();
    console.log('Raw stores result:', rawStoresResult);

    // Test direct SQL query for deals with correct column name
    const rawDealsResult = sqlite.prepare('SELECT * FROM deal_items WHERE storeId = 1').all();
    console.log('Raw deals result:', rawDealsResult);
  } catch (error) {
    console.error('Error testing database:', error);
  }
})();




