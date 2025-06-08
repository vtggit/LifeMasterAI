

import { eq } from 'drizzle-orm';
import { db } from './storage/index';
import { stores } from './storage/schema';

async function testDrizzle() {
  try {
    const userId = 1;
    console.log(`Fetching stores for userId: ${userId}`);

    // Use Drizzle ORM to fetch stores
    const storesResult = await db.select().from(stores).where(eq(stores.userId, userId));
    console.log('Drizzle result:', storesResult);
  } catch (error) {
    console.error('Error fetching stores:', error);
  }
}

testDrizzle();

