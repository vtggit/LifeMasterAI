import { StoreConfig } from './types';
import { KrogerScraper } from './stores/KrogerScraper';
import { WalmartScraper } from './stores/WalmartScraper';
import { BaseScraper } from './base/BaseScraper';

export class ScraperFactory {
  private static instance: ScraperFactory;
  private scrapers: Map<number, BaseScraper> = new Map();

  private constructor() {}

  static getInstance(): ScraperFactory {
    if (!ScraperFactory.instance) {
      ScraperFactory.instance = new ScraperFactory();
    }
    return ScraperFactory.instance;
  }

  getScraper(config: StoreConfig): BaseScraper {
    if (this.scrapers.has(config.id)) {
      return this.scrapers.get(config.id)!;
    }

    let scraper: BaseScraper;

    switch (config.name.toLowerCase()) {
      case 'kroger':
      case 'king soopers':
      case 'ralphs':
      case 'fred meyer':
      case 'smiths':
        scraper = new KrogerScraper(config);
        break;

      case 'walmart':
      case 'walmart supercenter':
        scraper = new WalmartScraper(config);
        break;

      default:
        throw new Error(`Unsupported store: ${config.name}`);
    }

    this.scrapers.set(config.id, scraper);
    return scraper;
  }

  clearScrapers(): void {
    this.scrapers.clear();
  }
}

// Example store configurations
export const STORE_CONFIGS: StoreConfig[] = [
  {
    id: 1,
    name: 'Kroger',
    baseUrl: 'https://www.kroger.com',
    loginRequired: false,
    apiKey: process.env.KROGER_API_KEY,
    requiresLocation: true,
    defaultLocation: {
      zipCode: '80202',
      storeId: '12345'
    }
  },
  {
    id: 2,
    name: 'Walmart',
    baseUrl: 'https://www.walmart.com',
    loginRequired: false,
    apiKey: process.env.WALMART_API_KEY,
    requiresLocation: true,
    defaultLocation: {
      zipCode: '80202',
      storeId: '67890'
    }
  }
];