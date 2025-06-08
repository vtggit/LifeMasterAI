import { Router } from 'express';
import { z } from 'zod';
import { db } from '../storage';
import { stores, dealItems } from '../storage/schema';
import { eq } from 'drizzle-orm';
import { dealScraperService } from '../services/scrapers';
import { ScrapedDeal, Store, StoreConfig } from '../services/scrapers/types';

const router = Router();

// Schema for store configuration
const storeConfigSchema = z.object({
  type: z.string(),
  name: z.string(),
  url: z.string().optional(),
  isDefault: z.boolean().optional(),
  config: z.object({
    apiKey: z.string().optional(),
    defaultLocation: z.object({
      zipCode: z.string().optional(),
      storeId: z.string().optional()
    }).optional()
  }).optional()
});
// Get all stores for a user
router.get('/', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    console.log(`Fetching stores for userId: ${userId}`);

    // Use Drizzle ORM to fetch stores
    const storesResult = await db.select().from(stores).where(eq(stores.userId, userId));
    console.log('Drizzle result:', storesResult);

    res.json(storesResult);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
// Add a new store
router.post('/', async (req, res) => {
  try {
    const { name, address, city, state, zipCode } = req.body;
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeData = storeConfigSchema.parse(req.body);
    
    // If this is marked as default, unset any existing default
    if (storeData.isDefault) {
      await db
        .update(stores)
        .set({ isDefault: false })
        .where(eq(stores.userId, userId));
    }

    const [newStore] = await db
      .insert(stores)
      .values({
        userId,
        name: storeData.name,
        type: storeData.type,
        url: storeData.url,
        isDefault: storeData.isDefault ?? false,
        config: storeData.config,
        status: 'active',
        createdAt: new Date()
      })
      .returning();

    res.json(newStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update a store
router.put('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeId = parseInt(req.params.id);
    const storeData = storeConfigSchema.parse(req.body);

    // If this is marked as default, unset any existing default
    if (storeData.isDefault) {
      await db
        .update(stores)
        .set({ isDefault: false })
        .where(eq(stores.userId, userId));
    }

    const [updatedStore] = await db
      .update(stores)
      .set({
        name: storeData.name,
        type: storeData.type,
        url: storeData.url,
        isDefault: storeData.isDefault,
        config: storeData.config,
        updatedAt: new Date()
      })
      .where(eq(stores.id, storeId))
      .returning();

    res.json(updatedStore);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

// Get deals for a store
router.get('/:id/deals', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeId = parseInt(req.params.id);
    const deals = await db
      .select()
      .from(dealItems)
      .where(eq(dealItems.storeId, storeId))
      .orderBy(dealItems.discountPercentage);

    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Delete a store
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeId = parseInt(req.params.id);
    
    // Delete associated deals first
    await db
      .delete(dealItems)
      .where(eq(dealItems.storeId, storeId));

    await db
      .delete(stores)
      .where(eq(stores.id, storeId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// Test store connection
router.post('/:id/test', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeId = parseInt(req.params.id);
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store.length) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Try to fetch a small number of deals to test the connection
    const deals = await dealScraperService.scrapeDealsForStore(storeId);
    const success = deals.length > 0;

    // Update store status
    await db
      .update(stores)
      .set({
        status: success ? 'active' : 'error',
        errorMessage: success ? null : 'Failed to fetch deals',
        lastSync: success ? new Date() : undefined
      })
      .where(eq(stores.id, storeId));

    res.json({ success });
  } catch (error) {
    console.error('Error testing store connection:', error);
    res.status(500).json({ error: 'Failed to test store connection' });
  }
});

// Sync store deals
router.post('/:id/sync', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    const storeId = parseInt(req.params.id);
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store.length) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Fetch new deals
    const deals = await dealScraperService.scrapeDealsForStore(storeId);

    // Delete existing deals for this store
    await db
      .delete(dealItems)
      .where(eq(dealItems.storeId, storeId));

    // Insert new deals
    if (deals.length > 0) {
      await db
        .insert(dealItems)
        .values(deals.map(deal => ({
          storeId,
          title: deal.title,
          salePrice: deal.salePrice,
          originalPrice: deal.originalPrice || 0,
          imageUrl: deal.imageUrl,
          category: deal.category,
          unit: deal.unit,
          discountPercentage: deal.discountPercentage,
          validUntil: deal.validUntil,
          createdAt: new Date()
        })));
    }

    // Update store sync status
    await db
      .update(stores)
      .set({
        status: 'active',
        lastSync: new Date(),
        errorMessage: null
      })
      .where(eq(stores.id, storeId));

    res.json({ success: true, dealsCount: deals.length });
  } catch (error) {
    console.error('Error syncing store deals:', error);
    
    // Update store error status
    try {
      await db
        .update(stores)
        .set({
          status: 'error',
          errorMessage: error.message || 'Failed to sync deals'
        })
        .where(eq(stores.id, parseInt(req.params.id)));
    } catch (dbError) {
      console.error('Error updating store status:', dbError);
    }

    res.status(500).json({ error: 'Failed to sync store deals' });
  }
});

export default router;