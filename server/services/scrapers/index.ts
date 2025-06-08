import { ScraperFactory, STORE_CONFIGS } from './ScraperFactory';
import { ScrapedDeal } from './types';
import { Cache } from './utils/Cache';

class DealScraperService {
  private factory: ScraperFactory;
  private cache: Cache;
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor() {
    this.factory = ScraperFactory.getInstance();
    this.cache = new Cache(this.CACHE_TTL);
  }

  async scrapeDealsForStore(storeId: number): Promise<ScrapedDeal[]> {
    const cacheKey = `store_deals_${storeId}`;
    const cachedDeals = this.cache.get<ScrapedDeal[]>(cacheKey);
    
    if (cachedDeals) {
      return cachedDeals;
    }

    const config = STORE_CONFIGS.find(c => c.id === storeId);
    if (!config) {
      throw new Error(`No configuration found for store ID ${storeId}`);
    }

    try {
      const scraper = this.factory.getScraper(config);
      const deals = await scraper.scrapeDeals();
      
      // Cache the results
      this.cache.set(cacheKey, deals);
      
      return deals;
    } catch (error) {
      console.error(`Error scraping deals for store ${storeId}:`, error);
      throw new Error(`Failed to scrape deals for store ${config.name}`);
    }
  }

  async scrapeDealsForAllStores(): Promise<Map<number, ScrapedDeal[]>> {
    const results = new Map<number, ScrapedDeal[]>();
    
    for (const config of STORE_CONFIGS) {
      try {
        const deals = await this.scrapeDealsForStore(config.id);
        results.set(config.id, deals);
      } catch (error) {
        console.error(`Error scraping deals for ${config.name}:`, error);
        results.set(config.id, []);
      }
    }
    
    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const dealScraperService = new DealScraperService();