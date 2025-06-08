




import express from 'express';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());

// Setup database
const sqlite = new Database('/workspace/LifeMasterAI/dev.db', { verbose: console.log });
sqlite.exec('PRAGMA foreign_keys = ON;');
const db = drizzle(sqlite);

// Define tables
const stores = {
  name: 'stores',
  columns: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    type: 'type',
    url: 'url',
    isDefault: 'isDefault',
    config: 'config',
    status: 'status',
    errorMessage: 'errorMessage',
    lastSync: 'lastSync',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
};

const dealItems = {
  name: 'deal_items',
  columns: {
    id: 'id',
    storeId: 'storeId', // This is the key fix - using storeId instead of store_id
    title: 'title',
    category: 'category',
    salePrice: 'sale_price',
    originalPrice: 'original_price',
    imageUrl: 'image_url',
    unit: 'unit',
    discountPercentage: 'discount_percentage',
    validUntil: 'valid_until',
    createdAt: 'created_at'
  }
};

// API routes
app.get('/stores', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    console.log(`Fetching stores for userId: ${userId}`);

    // Use raw SQL query
    const storesResult = sqlite.prepare(`SELECT * FROM ${stores.name} WHERE ${stores.columns.userId} = ?`).all(userId);
    console.log('Stores result:', storesResult);

    res.json(storesResult);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

app.get('/stores/:id/deals', async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({ error: 'Valid storeId is required' });
    }

    console.log(`Fetching deals for storeId: ${storeId}`);

    // Use raw SQL query with the correct column name
    const dealsResult = sqlite.prepare(`SELECT * FROM ${dealItems.name} WHERE ${dealItems.columns.storeId} = ?`).all(storeId);
    console.log('Deals result:', dealsResult);

    res.json(dealsResult);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});
// Start server
const PORT = 55429;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});




