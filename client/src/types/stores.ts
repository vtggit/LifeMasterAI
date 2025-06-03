export type StoreType = 
  | 'kroger'
  | 'king_soopers'
  | 'ralphs'
  | 'fred_meyer'
  | 'smiths'
  | 'walmart'
  | 'target'
  | 'safeway'
  | 'albertsons'
  | 'vons'
  | 'whole_foods'
  | 'publix'
  | 'aldi'
  | 'other';

export interface StoreConfig {
  apiKey?: string;
  defaultLocation?: {
    zipCode: string;
    storeId?: string;
  };
}

export interface Store {
  id: number;
  userId: number;
  name: string;
  type: StoreType;
  url?: string;
  isDefault: boolean;
  config?: StoreConfig;
  lastSync?: Date;
  status?: 'active' | 'error' | 'disabled';
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const STORE_CHAINS: Record<StoreType, { 
  name: string;
  baseUrl: string;
  requiresApi: boolean;
  requiresLocation: boolean;
  affiliates?: StoreType[];
}> = {
  kroger: {
    name: 'Kroger',
    baseUrl: 'https://www.kroger.com',
    requiresApi: true,
    requiresLocation: true,
    affiliates: ['king_soopers', 'ralphs', 'fred_meyer', 'smiths']
  },
  king_soopers: {
    name: 'King Soopers',
    baseUrl: 'https://www.kingsoopers.com',
    requiresApi: true,
    requiresLocation: true
  },
  ralphs: {
    name: "Ralph's",
    baseUrl: 'https://www.ralphs.com',
    requiresApi: true,
    requiresLocation: true
  },
  fred_meyer: {
    name: 'Fred Meyer',
    baseUrl: 'https://www.fredmeyer.com',
    requiresApi: true,
    requiresLocation: true
  },
  smiths: {
    name: "Smith's",
    baseUrl: 'https://www.smithsfoodanddrug.com',
    requiresApi: true,
    requiresLocation: true
  },
  walmart: {
    name: 'Walmart',
    baseUrl: 'https://www.walmart.com',
    requiresApi: true,
    requiresLocation: true
  },
  target: {
    name: 'Target',
    baseUrl: 'https://www.target.com',
    requiresApi: true,
    requiresLocation: true
  },
  safeway: {
    name: 'Safeway',
    baseUrl: 'https://www.safeway.com',
    requiresApi: true,
    requiresLocation: true,
    affiliates: ['albertsons', 'vons']
  },
  albertsons: {
    name: 'Albertsons',
    baseUrl: 'https://www.albertsons.com',
    requiresApi: true,
    requiresLocation: true
  },
  vons: {
    name: "Von's",
    baseUrl: 'https://www.vons.com',
    requiresApi: true,
    requiresLocation: true
  },
  whole_foods: {
    name: 'Whole Foods',
    baseUrl: 'https://www.wholefoodsmarket.com',
    requiresApi: true,
    requiresLocation: true
  },
  publix: {
    name: 'Publix',
    baseUrl: 'https://www.publix.com',
    requiresApi: false,
    requiresLocation: true
  },
  aldi: {
    name: 'ALDI',
    baseUrl: 'https://www.aldi.us',
    requiresApi: false,
    requiresLocation: true
  },
  other: {
    name: 'Other',
    baseUrl: '',
    requiresApi: false,
    requiresLocation: false
  }
};