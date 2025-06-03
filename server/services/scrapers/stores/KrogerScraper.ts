import { BaseScraper } from '../base/BaseScraper';
import { ScrapedDeal, StoreConfig } from '../types';
import axios from 'axios';

interface KrogerAuthToken {
  access_token: string;
  expires_at: number;
}

interface KrogerLocation {
  locationId: string;
  chain: string;
  address: {
    zipCode: string;
    county: string;
    state: string;
  };
}

export class KrogerScraper extends BaseScraper {
  private clientId: string;
  private clientSecret: string;
  private token: KrogerAuthToken | null = null;
  private locationId: string;
  private readonly AUTH_ENDPOINT = 'https://api.kroger.com/v1/connect/oauth2/token';
  private readonly API_ENDPOINT = 'https://api.kroger.com/v1';

  constructor(config: StoreConfig) {
    super(config.name, config.baseUrl);
    
    if (!config.apiKey || !config.defaultLocation?.zipCode) {
      throw new Error('Kroger scraper requires API key and default location');
    }

    const [clientId, clientSecret] = config.apiKey.split(':');
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.locationId = config.defaultLocation.storeId || '';
  }

  async scrapeDeals(): Promise<ScrapedDeal[]> {
    try {
      await this.ensureAuthenticated();
      if (!this.locationId) {
        await this.findNearestStore();
      }

      const promotions = await this.fetchPromotions();
      return await this.processPromotions(promotions);
    } catch (error) {
      console.error('Error scraping Kroger deals:', error);
      throw new Error(`Failed to scrape Kroger deals: ${error.message}`);
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.token && this.token.expires_at > Date.now()) {
      return;
    }

    try {
      const response = await axios.post(
        this.AUTH_ENDPOINT,
        'grant_type=client_credentials&scope=product.compact',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
          }
        }
      );

      this.token = {
        access_token: response.data.access_token,
        expires_at: Date.now() + (response.data.expires_in * 1000)
      };
    } catch (error) {
      throw new Error(`Kroger authentication failed: ${error.message}`);
    }
  }

  private async findNearestStore(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.API_ENDPOINT}/locations`,
        {
          params: {
            'filter.zipCode.near': this.config.defaultLocation.zipCode,
            'filter.limit': 1,
            'filter.chain': this.name.toLowerCase()
          },
          headers: {
            'Authorization': `Bearer ${this.token?.access_token}`
          }
        }
      );

      const locations: KrogerLocation[] = response.data.data;
      if (locations.length === 0) {
        throw new Error('No stores found in the specified area');
      }

      this.locationId = locations[0].locationId;
    } catch (error) {
      throw new Error(`Failed to find nearest store: ${error.message}`);
    }
  }

  private async fetchPromotions(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.API_ENDPOINT}/products`,
        {
          params: {
            'filter.locationId': this.locationId,
            'filter.limit': 50,
            'filter.promotion': 'true'
          },
          headers: {
            'Authorization': `Bearer ${this.token?.access_token}`
          }
        }
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch promotions: ${error.message}`);
    }
  }

  private async processPromotions(promotions: any[]): Promise<ScrapedDeal[]> {
    const deals: ScrapedDeal[] = [];

    for (const promo of promotions) {
      try {
        const deal = await this.processDeal({
          title: promo.description,
          salePrice: this.extractPrice(promo.items[0].price),
          originalPrice: this.extractPrice(promo.items[0].regularPrice),
          imageUrl: promo.images?.find((img: any) => img.perspective === 'front')?.sizes?.find((size: any) => size.size === 'medium')?.url,
          category: this.mapKrogerCategory(promo.categories[0]),
          unit: this.extractUnit(promo.items[0].size),
          validUntil: promo.promotion?.endDate,
          storeId: parseInt(this.locationId),
          externalId: promo.productId,
          url: null,
          description: promo.items[0].promotionDescription,
          restrictions: promo.items[0].promotionRestrictions,
          discountType: this.determineDiscountType(promo.items[0].promotionDescription),
          quantity: 1,
          limit: this.extractLimit(promo.items[0].promotionRestrictions)
        });

        if (deal) {
          deals.push(deal);
        }
      } catch (error) {
        console.error(`Error processing Kroger promotion: ${error.message}`);
        continue;
      }
    }

    return deals;
  }

  private extractPrice(priceInfo: any): number {
    return parseFloat(priceInfo.regular || priceInfo.promo || '0');
  }

  private extractUnit(size: string): string | null {
    const unitMap: Record<string, string> = {
      'OZ': 'oz',
      'LB': 'lb',
      'EA': 'each',
      'CT': 'count',
      'PKG': 'pack'
    };

    const match = size.match(/([0-9.]+)\s*([A-Z]+)/i);
    return match ? unitMap[match[2].toUpperCase()] || null : null;
  }

  private mapKrogerCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'Produce': 'produce',
      'Meat & Seafood': 'meat',
      'Dairy': 'dairy',
      'Bakery': 'bakery',
      'Pantry': 'pantry',
      'Frozen': 'frozen',
      'Beverages': 'beverages',
      'Snacks': 'snacks',
      'Household Essentials': 'household',
      'Personal Care': 'personal_care',
      'Baby': 'baby',
      'Pet': 'pets'
    };

    return categoryMap[category] || 'other';
  }

  private determineDiscountType(description: string): 'sale' | 'bogo' | 'points' | 'coupon' {
    const desc = description.toLowerCase();
    if (desc.includes('buy one get one') || desc.includes('bogo')) {
      return 'bogo';
    }
    if (desc.includes('points') || desc.includes('rewards')) {
      return 'points';
    }
    if (desc.includes('coupon') || desc.includes('clip')) {
      return 'coupon';
    }
    return 'sale';
  }

  private extractLimit(restrictions: string): number | null {
    const match = restrictions?.match(/limit\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
}