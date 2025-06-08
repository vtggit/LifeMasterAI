
import Database from 'better-sqlite3';

const sqlite = new Database('/workspace/LifeMasterAI/dev.db', { verbose: console.log });

// Test query
const test = sqlite.prepare('SELECT * FROM stores').all();
console.log('Test query result:', test);

sqlite.close();
