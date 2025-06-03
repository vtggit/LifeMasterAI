import axios, { AxiosInstance } from 'axios';
import { ScrapedDeal } from '../types';
import { RateLimiter } from '../utils/RateLimiter';
import { Cache } from '../utils/Cache';
import { ProxyManager } from '../utils/ProxyManager';
import { validateDeal } from '../utils/validators';
import { normalizePrice, normalizeCategory, normalizeUnit } from '../utils/normalizers';

export abstract class BaseScraper {
  protected name: string;
  protected baseUrl: string;
  protected http: AxiosInstance;
  protected rateLimiter: RateLimiter;
  protected cache: Cache;
  protected proxyManager: ProxyManager;
  protected maxRetries: number = 3;
  protected retryDelay: number = 1000; // ms

  constructor(name: string, baseUrl: string) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.rateLimiter = new RateLimiter();
    this.cache = new Cache();
    this.proxyManager = new ProxyManager();
    
    this.http = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
  }

  abstract scrapeDeals(): Promise<ScrapedDeal[]>;
  
  protected async fetchPage(url: string): Promise<string> {
    await this.rateLimiter.waitForToken();
    
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const proxy = await this.proxyManager.getProxy();
        const response = await this.http.get(url, {
          proxy,
          headers: this.getHeaders()
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        continue;
      }
    }
    throw new Error(`Failed to fetch ${url} after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };
  }

  protected async processDeal(rawDeal: any): Promise<ScrapedDeal | null> {
    try {
      const deal: ScrapedDeal = {
        title: this.sanitizeText(rawDeal.title),
        salePrice: normalizePrice(rawDeal.salePrice),
        originalPrice: normalizePrice(rawDeal.originalPrice),
        imageUrl: this.validateImageUrl(rawDeal.imageUrl),
        category: normalizeCategory(rawDeal.category),
        unit: normalizeUnit(rawDeal.unit),
        validUntil: this.parseDate(rawDeal.validUntil),
        storeId: rawDeal.storeId,
        externalId: rawDeal.externalId || null,
        url: rawDeal.url || null,
        description: this.sanitizeText(rawDeal.description) || null,
        restrictions: this.sanitizeText(rawDeal.restrictions) || null,
        discountType: rawDeal.discountType || 'sale',
        quantity: rawDeal.quantity || 1,
        limit: rawDeal.limit || null
      };

      if (!validateDeal(deal)) {
        return null;
      }

      return deal;
    } catch (error) {
      console.error(`Error processing deal: ${error}`);
      return null;
    }
  }

  protected sanitizeText(text: string | null | undefined): string {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  protected validateImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return null;
    }
  }

  protected parseDate(date: string | null | undefined): Date | null {
    if (!date) return null;
    try {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  protected calculateDiscountPercentage(original: number, sale: number): number | null {
    if (!original || !sale || original <= 0 || sale <= 0) return null;
    const percentage = ((original - sale) / original) * 100;
    return Math.round(percentage * 10) / 10; // Round to 1 decimal place
  }
}