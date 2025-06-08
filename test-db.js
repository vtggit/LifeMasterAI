
const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { stores, dealItems } = require('./server/storage/schema');

// Create a SQLite database connection
const sqlite = new Database('/workspace/LifeMasterAI/dev.db', { verbose: console.log });

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

// Create a drizzle instance
const db = drizzle(sqlite, { schema: require('./server/storage/schema') });

(async () => {
  try {
    console.log('Testing database connection...');

    // Test stores query
    const storesResult = await db.select().from(stores).where(db.sql`${stores.userId} = 1`);
    console.log('Stores result:', storesResult);

    // Test dealItems query
    const dealsResult = await db.select().from(dealItems).where(db.sql`${dealItems.storeId} = 1`);
    console.log('Deals result:', dealsResult);
  } catch (error) {
    console.error('Error testing database:', error);
  }
})();
