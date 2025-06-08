import { BaseScraper } from '../base/BaseScraper';
import { ScrapedDeal, StoreConfig } from '../types';
import axios from 'axios';

interface WalmartStore {
  id: string;
  name: string;
  address: {
    postalCode: string;
    state: string;
  };
}

export class WalmartScraper extends BaseScraper {
  private apiKey: string;
  private storeId: string;
  private readonly API_ENDPOINT = 'https://developer.api.walmart.com/api-proxy/service';

  constructor(config: StoreConfig) {
    super(config.name, config.baseUrl);
    
    if (!config.apiKey || !config.defaultLocation?.zipCode) {
      throw new Error('Walmart scraper requires API key and default location');
    }

    this.apiKey = config.apiKey;
    this.storeId = config.defaultLocation.storeId || '';
  }

  async scrapeDeals(): Promise<ScrapedDeal[]> {
    try {
      if (!this.storeId) {
        await this.findNearestStore();
      }

      const deals = await this.fetchDeals();
      return await this.processDeals(deals);
    } catch (error) {
      console.error('Error scraping Walmart deals:', error);
      throw new Error(`Failed to scrape Walmart deals: ${error.message}`);
    }
  }

  private async findNearestStore(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.API_ENDPOINT}/stores/search`,
        {
          params: {
            postalCode: this.config.defaultLocation.zipCode,
            limit: 1
          },
          headers: {
            'WM_SEC.ACCESS_TOKEN': this.apiKey,
            'WM_QOS.CORRELATION_ID': Date.now().toString()
          }
        }
      );

      const stores: WalmartStore[] = response.data.data;
      if (stores.length === 0) {
        throw new Error('No Walmart stores found in the specified area');
      }

      this.storeId = stores[0].id;
    } catch (error) {
      throw new Error(`Failed to find nearest Walmart store: ${error.message}`);
    }
  }

  private async fetchDeals(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.API_ENDPOINT}/products/deals`,
        {
          params: {
            storeId: this.storeId,
            limit: 50
          },
          headers: {
            'WM_SEC.ACCESS_TOKEN': this.apiKey,
            'WM_QOS.CORRELATION_ID': Date.now().toString()
          }
        }
      );

      return response.data.data.items;
    } catch (error) {
      throw new Error(`Failed to fetch Walmart deals: ${error.message}`);
    }
  }

  private async processDeals(deals: any[]): Promise<ScrapedDeal[]> {
    const processedDeals: ScrapedDeal[] = [];

    for (const item of deals) {
      try {
        const deal = await this.processDeal({
          title: item.name,
          salePrice: item.salePrice,
          originalPrice: item.regularPrice,
          imageUrl: item.images.primary,
          category: this.mapWalmartCategory(item.departmentName),
          unit: this.extractUnit(item.unitType || item.name),
          validUntil: item.offerExpiryTime,
          storeId: parseInt(this.storeId),
          externalId: item.usItemId,
          url: `https://www.walmart.com/ip/${item.usItemId}`,
          description: item.shortDescription,
          restrictions: item.offerRestrictions,
          discountType: this.determineDiscountType(item),
          quantity: 1,
          limit: this.extractLimit(item.offerRestrictions)
        });

        if (deal) {
          processedDeals.push(deal);
        }
      } catch (error) {
        console.error(`Error processing Walmart deal: ${error.message}`);
        continue;
      }
    }

    return processedDeals;
  }

  private mapWalmartCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'Fresh Produce': 'produce',
      'Meat & Seafood': 'meat',
      'Dairy & Eggs': 'dairy',
      'Bakery & Bread': 'bakery',
      'Pantry': 'pantry',
      'Frozen Foods': 'frozen',
      'Beverages': 'beverages',
      'Snacks': 'snacks',
      'Household Essentials': 'household',
      'Personal Care': 'personal_care',
      'Baby': 'baby',
      'Pets': 'pets'
    };

    return categoryMap[category] || 'other';
  }

  private extractUnit(text: string): string | null {
    const unitMap: Record<string, string> = {
      'EACH': 'each',
      'POUND': 'lb',
      'OUNCE': 'oz',
      'COUNT': 'count',
      'PACKAGE': 'pack'
    };

    // First check if we have a direct unit type
    if (text in unitMap) {
      return unitMap[text];
    }

    // Then try to extract from the title
    const match = text.match(/(\d+)\s*(oz|lb|ct|pk|ea)\b/i);
    if (match) {
      const unit = match[2].toLowerCase();
      switch (unit) {
        case 'oz': return 'oz';
        case 'lb': return 'lb';
        case 'ct': return 'count';
        case 'pk': return 'pack';
        case 'ea': return 'each';
      }
    }

    return null;
  }

  private determineDiscountType(item: any): 'sale' | 'bogo' | 'points' | 'coupon' {
    if (item.offerType === 'BOGO') return 'bogo';
    if (item.offerType === 'REWARDS') return 'points';
    if (item.offerType === 'COUPON') return 'coupon';
    return 'sale';
  }

  private extractLimit(restrictions: string): number | null {
    if (!restrictions) return null;
    const match = restrictions.match(/limit\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
}