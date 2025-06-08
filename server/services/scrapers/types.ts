export interface ScrapedDeal {
  title: string;
  salePrice: number;
  originalPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  unit: string | null;
  validUntil: Date | null;
  storeId: number;
  externalId: string | null;
  url: string | null;
  description: string | null;
  restrictions: string | null;
  discountType: 'sale' | 'bogo' | 'points' | 'coupon';
  quantity: number;
  limit: number | null;
}

export interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

export interface StoreConfig {
  id: number;
  name: string;
  baseUrl: string;
  loginRequired: boolean;
  apiKey?: string;
  requiresLocation?: boolean;
  defaultLocation?: {
    zipCode: string;
    storeId?: string;
  };
}

export type Category = 
  | 'produce'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'snacks'
  | 'household'
  | 'personal_care'
  | 'baby'
  | 'pets'
  | 'other';

export type Unit = 
  | 'lb'
  | 'oz'
  | 'g'
  | 'kg'
  | 'each'
  | 'bunch'
  | 'pack'
  | 'dozen'
  | 'fl_oz'
  | 'ml'
  | 'l'
  | 'gal'
  | 'qt'
  | 'pt'
  | 'count';

export interface ScraperError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  storeName: string;
  url?: string;
}